gulp       = require 'gulp'
prefix     = require 'gulp-autoprefixer'
coffee     = require 'gulp-coffee'
sass       = require 'gulp-sass'
gutil      = require 'gulp-util'
sourcemaps = require 'gulp-sourcemaps'
uglify     = require 'gulp-uglify'
minify     = require 'gulp-minify-css'
del        = require 'del'
connect    = require 'gulp-connect'
inject     = require 'gulp-inject'
evtstr     = require 'event-stream'
concat     = require 'gulp-concat'
rev        = require 'gulp-rev'

# should match modules/environment.php
CACHE_ARGS = '4b9624cc-0ba1-4872-af4d-ed08273a7a15'
SITE_PATH = '<?= get_template_directory_uri(); ?>'
READER_PATH = '/reader'

gulp.task 'sass', ->
  gulp.src 'src/sass/main.scss'
  .pipe sass
    outputStyle: 'nested'
  .on 'error', sass.logError
  .pipe prefix
    browsers: ['last 2 versions']
    cascade: false
    map:true
  .pipe gulp.dest 'src/sass'

gulp.task 'styles', ['sass'], ->
  gulp.src 'src/sass/main.css'
  .pipe sourcemaps.init()
  .pipe sourcemaps.write()
  .pipe gulp.dest 'src/css'

gulp.task 'coffee', ->
  gulp.src [
    'src/coffee/main.coffee',
    'src/coffee/**/*.coffee'
  ]
  .pipe sourcemaps.init()
  .pipe coffee(
    bare:true
  ).on 'error', gutil.log
  .pipe sourcemaps.write()
  .pipe gulp.dest 'src/js'

gulp.task 'inject:development', ->
  return gulp.src([
    '../header.php',
    '../footer.php',
    '../index.php'
  ])
  .pipe(inject(gulp.src([
    'src/bower_components/nprogress/nprogress.css'
    'src/css/*.css'
  ], {read:false}), {
    relative:false
    transform: (filepath, file, i, length)->
      "<link rel=\"stylesheet\" type=\"text/css\" href=\"#{SITE_PATH}#{READER_PATH}#{filepath}?v=#{CACHE_ARGS}\"/>"
  }))
  .pipe inject(gulp.src([
    'src/bower_components/nprogress/nprogress.js'
    'src/vendor/**/*.js'
    'src/js/main.js'
    'src/js/*.js'
  ], {read:false}), {
    relative:false
    transform: (filepath, file, i, length)->
      "<script src=\"#{SITE_PATH}#{READER_PATH}#{filepath}?v=#{CACHE_ARGS}\"></script>"
  })
  .pipe gulp.dest '../'

gulp.task 'inject:production', ['rev'], ->
  return gulp.src([
    '../header.php',
    '../footer.php',
    '../index.php'
  ])
  .pipe inject(gulp.src('dist/css/*.css', {read:false}),{
    relative:false
    transform:(filepath, file, i, length)->
      "<link rel=\"stylesheet\" type=\"text/css\" href=\"#{SITE_PATH}#{READER_PATH}#{filepath}\"/>"
  })
  .pipe inject(gulp.src('dist/js/*.js', {read:false}),{
    relative:false
    transform:(filepath, file, i, length)->
      "<script src=\"#{SITE_PATH}#{READER_PATH}#{filepath}\"></script>"
  })
  .pipe gulp.dest '../'

gulp.task 'rev', ['clean', 'copy'], ->
  gulp.src [
    'src/css/*.css'
    'src/bower_components/nprogress/nprogress.css'
  ]
    .pipe minify()
    .pipe rev()
    .pipe gulp.dest 'dist/css'

  gulp.src([
    'src/bower_components/nprogress/nprogress.js'
    'src/vendor/scoped-polyfill-master/scoped.js'
    'src/vendor/hammer/hammer.min.js'
    'src/js/main.js'
    'src/js/*.js'
  ])
  .pipe concat('main.js')
  .pipe uglify()
  .pipe rev()
  .pipe gulp.dest 'dist/js'

gulp.task 'watch', ->
  gulp.watch([
    'src/js/**/*.js'
    'src/css/**/*.css'
    '../*.php'
    '../components/*.php'
  ]).on 'change', (file) ->
    gutil.log('Reload:', gutil.colors.magenta("#{file.path}"))
    connect.reload()

  gulp.watch 'src/sass/**/*.scss', ['sass', 'inject:development']
  gulp.watch 'src/coffee/**/*.coffee', ['coffee', 'inject:development']
  gulp.watch 'src/sass/main.css', ['styles']

gulp.task 'clean', ->
  return del ['dist/']

gulp.task 'copy', ['clean'], ->
  gulp.src [
    'src/img/**/*.{jpg,png,svg,gif,webp,ico}'
  ]
  .pipe gulp.dest 'dist/img'

  gulp.src [
    'src/fonts/**/*.*'
  ]
  .pipe gulp.dest 'dist/fonts'

gulp.task 'connect:development', ->
  connect.server
    root:'./'
    livereload:false

gulp.task 'connect:production', ->
  connect.server
    root:'./dist'
    livereload:false

gulp.task 'serve', [
  'styles'
  'coffee'
  'inject:development'
  'connect:development'
  'watch'
  ], -> @

gulp.task 'build', [
  'clean'
  'copy'
  'styles'
  'coffee'
  'inject:production'
  # 'connect:production'
  ], -> @
