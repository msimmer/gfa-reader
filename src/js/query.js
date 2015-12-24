App.prototype.Query = (function() {
  var model;

  model = function(options) {
    if (options == null) {
      options = {};
    }
    return {
      url: options.url || '',
      data: options.data || {},
      dataType: options.dataType || '',
      async: options.async || true,
      cache: options.cache || true,
      headers: options.headers || {}
    };
  };

  function Query(options) {
    if (options == null) {
      options = {};
    }
  }

  Query.prototype.request = function(options) {
    if (options == null) {
      options = {};
    }
    return $.ajax({
      url: options.url,
      dataType: options.dataType,
      cache: options.cache,
      headers: options.headers
    });
  };

  Query.prototype.xml = function(url) {
    return this.request(model({
      url: url,
      dataType: 'xml'
    }));
  };

  Query.prototype.html = function(url) {
    return this.request(model({
      url: url,
      dataType: 'html'
    }));
  };

  return Query;

})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInF1ZXJ5LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBTSxHQUFHLENBQUEsU0FBRSxDQUFBO0FBRVQsTUFBQTs7RUFBQSxLQUFBLEdBQVEsU0FBQyxPQUFEOztNQUFDLFVBQVU7O0FBQ2pCLFdBQU87TUFDTCxHQUFBLEVBQVcsT0FBTyxDQUFDLEdBQVIsSUFBb0IsRUFEMUI7TUFFTCxJQUFBLEVBQVcsT0FBTyxDQUFDLElBQVIsSUFBb0IsRUFGMUI7TUFHTCxRQUFBLEVBQVcsT0FBTyxDQUFDLFFBQVIsSUFBb0IsRUFIMUI7TUFJTCxLQUFBLEVBQVcsT0FBTyxDQUFDLEtBQVIsSUFBb0IsSUFKMUI7TUFLTCxLQUFBLEVBQVcsT0FBTyxDQUFDLEtBQVIsSUFBb0IsSUFMMUI7TUFNTCxPQUFBLEVBQVcsT0FBTyxDQUFDLE9BQVIsSUFBb0IsRUFOMUI7O0VBREQ7O0VBVUssZUFBQyxPQUFEOztNQUFDLFVBQVU7O0VBQVg7O2tCQUViLE9BQUEsR0FBUyxTQUFDLE9BQUQ7O01BQUMsVUFBVTs7V0FDbEIsQ0FBQyxDQUFDLElBQUYsQ0FDRTtNQUFBLEdBQUEsRUFBVyxPQUFPLENBQUMsR0FBbkI7TUFDQSxRQUFBLEVBQVcsT0FBTyxDQUFDLFFBRG5CO01BRUEsS0FBQSxFQUFXLE9BQU8sQ0FBQyxLQUZuQjtNQUdBLE9BQUEsRUFBVyxPQUFPLENBQUMsT0FIbkI7S0FERjtFQURPOztrQkFPVCxHQUFBLEdBQUssU0FBQyxHQUFEO1dBQ0gsSUFBQyxDQUFBLE9BQUQsQ0FBUyxLQUFBLENBQ1A7TUFBQSxHQUFBLEVBQUssR0FBTDtNQUNBLFFBQUEsRUFBUyxLQURUO0tBRE8sQ0FBVDtFQURHOztrQkFLTCxJQUFBLEdBQU0sU0FBQyxHQUFEO1dBQ0osSUFBQyxDQUFBLE9BQUQsQ0FBUyxLQUFBLENBQ1A7TUFBQSxHQUFBLEVBQUssR0FBTDtNQUNBLFFBQUEsRUFBVSxNQURWO0tBRE8sQ0FBVDtFQURJIiwiZmlsZSI6InF1ZXJ5LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQXBwOjpRdWVyeVxuXG4gIG1vZGVsID0gKG9wdGlvbnMgPSB7fSkgLT5cbiAgICByZXR1cm4ge1xuICAgICAgdXJsICAgICAgOiBvcHRpb25zLnVybCAgICAgIHx8ICcnXG4gICAgICBkYXRhICAgICA6IG9wdGlvbnMuZGF0YSAgICAgfHwge31cbiAgICAgIGRhdGFUeXBlIDogb3B0aW9ucy5kYXRhVHlwZSB8fCAnJ1xuICAgICAgYXN5bmMgICAgOiBvcHRpb25zLmFzeW5jICAgIHx8IHRydWVcbiAgICAgIGNhY2hlICAgIDogb3B0aW9ucy5jYWNoZSAgICB8fCB0cnVlXG4gICAgICBoZWFkZXJzICA6IG9wdGlvbnMuaGVhZGVycyAgfHwge31cbiAgICB9XG5cbiAgY29uc3RydWN0b3I6IChvcHRpb25zID0ge30pIC0+XG5cbiAgcmVxdWVzdDogKG9wdGlvbnMgPSB7fSktPlxuICAgICQuYWpheFxuICAgICAgdXJsICAgICAgOiBvcHRpb25zLnVybFxuICAgICAgZGF0YVR5cGUgOiBvcHRpb25zLmRhdGFUeXBlXG4gICAgICBjYWNoZSAgICA6IG9wdGlvbnMuY2FjaGVcbiAgICAgIGhlYWRlcnMgIDogb3B0aW9ucy5oZWFkZXJzXG5cbiAgeG1sOiAodXJsKS0+XG4gICAgQHJlcXVlc3QgbW9kZWxcbiAgICAgIHVybDogdXJsXG4gICAgICBkYXRhVHlwZToneG1sJ1xuXG4gIGh0bWw6ICh1cmwpLT5cbiAgICBAcmVxdWVzdCBtb2RlbFxuICAgICAgdXJsOiB1cmxcbiAgICAgIGRhdGFUeXBlOiAnaHRtbCdcbiJdfQ==
