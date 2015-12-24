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
bowerFiles = require 'main-bower-files'
inject     = require 'gulp-inject'
evtstr     = require 'event-stream'
concat     = require 'gulp-concat'
rev        = require 'gulp-rev'


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
  return gulp.src 'index.html'
  .pipe inject gulp.src(bowerFiles(
    'overrides':
      'modernizr':
        'main': 'modernizr.js'
  ), {read: false}), {name: 'bower'}
  .pipe inject(gulp.src 'src/css/*.css', {read:false})
  .pipe inject(gulp.src 'src/css/*.css', {read:false})
  .pipe inject(gulp.src [
    'src/vendor/**/*.js'
    'src/js/main.js'
    'src/js/*.js'], {read:false})
  .pipe gulp.dest './'

gulp.task 'inject:production', ['rev'], ->
  gulp.src 'dist/index.html'
  .pipe inject gulp.src 'dist/css/*.css', {read:false}
  .pipe inject gulp.src 'dist/js/*.js', {read:false}
  .pipe gulp.dest 'dist'

gulp.task 'rev', ->
  gulp.src ['src/css/*.css']
    .pipe minify()
    .pipe rev()
    .pipe gulp.dest 'dist/css'

  gulp.src(
    bowerFiles(
      overrides:
        modernizr:
          main:'modernizr.js'
    ).concat [
      'src/vendor/*.js'
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
    '*.{html,xhtml,htm}'
  ]).on 'change', (file) ->
    gutil.log('Reload:', gutil.colors.magenta("#{file.path}"))
    connect.reload()

  gulp.watch 'src/sass/**/*.scss', ['sass']
  gulp.watch 'src/sass/main.css', ['styles']
  gulp.watch 'src/coffee/**/*.coffee', ['coffee']

gulp.task 'clean', ->
  del ['dist/**']

gulp.task 'copy', ->
  gulp.src [
    '*.html'
    'src/img/**/*.{jpg,png,svg,gif,webp,ico}'
    'src/fonts/**/*.*'
  ],
    base: './'
  .pipe gulp.dest 'dist'

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
  'connect:production'
  ], -> @
