Reader.prototype.Template = (function() {
  function Template(options) {
    var flags, pattern, ref, ref1, ref2, ref3, token;
    this.options = options != null ? options : {};
    token = {
      start: ((ref = this.options.token) != null ? ref.start : void 0) || '{{',
      end: ((ref1 = this.options.token) != null ? ref1.end : void 0) || '}}',
      sep: ((ref2 = this.options.token) != null ? ref2.sep : void 0) || '\\s',
      div: ((ref3 = this.options.token) != null ? ref3.div : void 0) || '\\|'
    };
    flags = '';
    pattern = "" + token.start + token.sep + "([^" + token.sep + "]+?)" + token.sep + token.div + token.sep + "([^" + token.sep + "]+?)" + token.sep + token.end;
    this.regex = new RegExp(pattern, flags);
  }

  Template.prototype.titleCase = function(str) {
    var tmp;
    tmp = str.split('');
    tmp[0] = tmp[0].toUpperCase();
    return tmp = tmp.join('');
  };

  Template.prototype.parse = function(str, abspath) {
    var asset, elem, match, path;
    while ((match = this.regex.exec(str)) !== null) {
      asset = match[1];
      path = "" + abspath + (this.titleCase(match[2])) + "/" + asset;
      elem = "<img alt=\"" + asset + "\" src=\"" + path + "\"/>";
      str = str.replace(match[0], elem);
    }
    return str;
  };

  return Template;

})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlbXBsYXRlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBTSxNQUFNLENBQUEsU0FBRSxDQUFBO0VBRUMsa0JBQUMsT0FBRDtBQUVYLFFBQUE7SUFGWSxJQUFDLENBQUEsNEJBQUQsVUFBVztJQUV2QixLQUFBLEdBQ0U7TUFBQSxLQUFBLDJDQUFzQixDQUFFLGVBQWhCLElBQXlCLElBQWpDO01BQ0EsR0FBQSw2Q0FBc0IsQ0FBRSxhQUFoQixJQUF1QixJQUQvQjtNQUVBLEdBQUEsNkNBQXNCLENBQUUsYUFBaEIsSUFBdUIsS0FGL0I7TUFHQSxHQUFBLDZDQUFzQixDQUFFLGFBQWhCLElBQXVCLEtBSC9COztJQUlGLEtBQUEsR0FBUTtJQUNSLE9BQUEsR0FBVSxFQUFBLEdBQUcsS0FBSyxDQUFDLEtBQVQsR0FDRyxLQUFLLENBQUMsR0FEVCxHQUNhLEtBRGIsR0FFTSxLQUFLLENBQUMsR0FGWixHQUVnQixNQUZoQixHQUdHLEtBQUssQ0FBQyxHQUhULEdBSUcsS0FBSyxDQUFDLEdBSlQsR0FLRyxLQUFLLENBQUMsR0FMVCxHQUthLEtBTGIsR0FNTSxLQUFLLENBQUMsR0FOWixHQU1nQixNQU5oQixHQU9HLEtBQUssQ0FBQyxHQVBULEdBUUcsS0FBSyxDQUFDO0lBRW5CLElBQUMsQ0FBQSxLQUFELEdBQWEsSUFBQSxNQUFBLENBQU8sT0FBUCxFQUFnQixLQUFoQjtFQWxCRjs7cUJBb0JiLFNBQUEsR0FBVyxTQUFDLEdBQUQ7QUFDVCxRQUFBO0lBQUEsR0FBQSxHQUFNLEdBQUcsQ0FBQyxLQUFKLENBQVUsRUFBVjtJQUNOLEdBQUksQ0FBQSxDQUFBLENBQUosR0FBUyxHQUFJLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBUCxDQUFBO1dBQ1QsR0FBQSxHQUFNLEdBQUcsQ0FBQyxJQUFKLENBQVMsRUFBVDtFQUhHOztxQkFLWCxLQUFBLEdBQU8sU0FBQyxHQUFELEVBQU0sT0FBTjtBQUNMLFFBQUE7QUFBQSxXQUFNLENBQUMsS0FBQSxHQUFRLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFZLEdBQVosQ0FBVCxDQUFBLEtBQThCLElBQXBDO01BQ0UsS0FBQSxHQUFRLEtBQU0sQ0FBQSxDQUFBO01BQ2QsSUFBQSxHQUFPLEVBQUEsR0FBRyxPQUFILEdBQVksQ0FBQyxJQUFDLENBQUEsU0FBRCxDQUFXLEtBQU0sQ0FBQSxDQUFBLENBQWpCLENBQUQsQ0FBWixHQUFrQyxHQUFsQyxHQUFxQztNQUk1QyxJQUFBLEdBQU8sYUFBQSxHQUFjLEtBQWQsR0FBb0IsV0FBcEIsR0FBK0IsSUFBL0IsR0FBb0M7TUFDM0MsR0FBQSxHQUFNLEdBQUcsQ0FBQyxPQUFKLENBQVksS0FBTSxDQUFBLENBQUEsQ0FBbEIsRUFBc0IsSUFBdEI7SUFQUjtBQVFBLFdBQU87RUFURiIsImZpbGUiOiJ0ZW1wbGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFJlYWRlcjo6VGVtcGxhdGVcblxuICBjb25zdHJ1Y3RvcjogKEBvcHRpb25zID0ge30pIC0+XG5cbiAgICB0b2tlbiA9XG4gICAgICBzdGFydCA6IEBvcHRpb25zLnRva2VuPy5zdGFydCBvciAne3snXG4gICAgICBlbmQgICA6IEBvcHRpb25zLnRva2VuPy5lbmQgb3IgJ319J1xuICAgICAgc2VwICAgOiBAb3B0aW9ucy50b2tlbj8uc2VwIG9yICdcXFxccydcbiAgICAgIGRpdiAgIDogQG9wdGlvbnMudG9rZW4/LmRpdiBvciAnXFxcXHwnXG4gICAgZmxhZ3MgPSAnJ1xuICAgIHBhdHRlcm4gPSBcIiN7dG9rZW4uc3RhcnR9XFxcbiAgICAgICAgICAgICAgICN7dG9rZW4uc2VwfVxcXG4gICAgICAgICAgICAgICAoW14je3Rva2VuLnNlcH1dKz8pXFxcbiAgICAgICAgICAgICAgICN7dG9rZW4uc2VwfVxcXG4gICAgICAgICAgICAgICAje3Rva2VuLmRpdn1cXFxuICAgICAgICAgICAgICAgI3t0b2tlbi5zZXB9XFxcbiAgICAgICAgICAgICAgIChbXiN7dG9rZW4uc2VwfV0rPylcXFxuICAgICAgICAgICAgICAgI3t0b2tlbi5zZXB9XFxcbiAgICAgICAgICAgICAgICN7dG9rZW4uZW5kfVwiXG5cbiAgICBAcmVnZXggPSBuZXcgUmVnRXhwKHBhdHRlcm4sIGZsYWdzKVxuXG4gIHRpdGxlQ2FzZTogKHN0cikgLT5cbiAgICB0bXAgPSBzdHIuc3BsaXQoJycpXG4gICAgdG1wWzBdID0gdG1wWzBdLnRvVXBwZXJDYXNlKClcbiAgICB0bXAgPSB0bXAuam9pbignJylcblxuICBwYXJzZTogKHN0ciwgYWJzcGF0aCkgLT5cbiAgICB3aGlsZSAobWF0Y2ggPSBAcmVnZXguZXhlYyhzdHIpKSAhPSBudWxsXG4gICAgICBhc3NldCA9IG1hdGNoWzFdXG4gICAgICBwYXRoID0gXCIje2Fic3BhdGh9I3tAdGl0bGVDYXNlKG1hdGNoWzJdKX0vI3thc3NldH1cIlxuXG4gICAgICAjIGN1cnJlbnRseSBvbmx5IGltYWdlc1xuICAgICAgI1xuICAgICAgZWxlbSA9IFwiPGltZyBhbHQ9XFxcIiN7YXNzZXR9XFxcIiBzcmM9XFxcIiN7cGF0aH1cXFwiLz5cIlxuICAgICAgc3RyID0gc3RyLnJlcGxhY2UobWF0Y2hbMF0sIGVsZW0pXG4gICAgcmV0dXJuIHN0clxuXG5cbiJdfQ==
