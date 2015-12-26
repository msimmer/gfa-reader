Reader.prototype.Query = (function() {
  var model;

  function Query(options1) {
    this.options = options1 != null ? options1 : {};
  }

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInF1ZXJ5LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBTSxNQUFNLENBQUEsU0FBRSxDQUFBO0FBRVosTUFBQTs7RUFBYSxlQUFDLFFBQUQ7SUFBQyxJQUFDLENBQUEsNkJBQUQsV0FBVztFQUFaOztFQUViLEtBQUEsR0FBUSxTQUFDLE9BQUQ7O01BQUMsVUFBVTs7QUFDakIsV0FBTztNQUNMLEdBQUEsRUFBVyxPQUFPLENBQUMsR0FBUixJQUFvQixFQUQxQjtNQUVMLElBQUEsRUFBVyxPQUFPLENBQUMsSUFBUixJQUFvQixFQUYxQjtNQUdMLFFBQUEsRUFBVyxPQUFPLENBQUMsUUFBUixJQUFvQixFQUgxQjtNQUlMLEtBQUEsRUFBVyxPQUFPLENBQUMsS0FBUixJQUFvQixJQUoxQjtNQUtMLEtBQUEsRUFBVyxPQUFPLENBQUMsS0FBUixJQUFvQixJQUwxQjtNQU1MLE9BQUEsRUFBVyxPQUFPLENBQUMsT0FBUixJQUFvQixFQU4xQjs7RUFERDs7a0JBVVIsT0FBQSxHQUFTLFNBQUMsT0FBRDs7TUFBQyxVQUFVOztXQUNsQixDQUFDLENBQUMsSUFBRixDQUNFO01BQUEsR0FBQSxFQUFXLE9BQU8sQ0FBQyxHQUFuQjtNQUNBLFFBQUEsRUFBVyxPQUFPLENBQUMsUUFEbkI7TUFFQSxLQUFBLEVBQVcsT0FBTyxDQUFDLEtBRm5CO01BR0EsT0FBQSxFQUFXLE9BQU8sQ0FBQyxPQUhuQjtLQURGO0VBRE87O2tCQU9ULEdBQUEsR0FBSyxTQUFDLEdBQUQ7V0FDSCxJQUFDLENBQUEsT0FBRCxDQUFTLEtBQUEsQ0FDUDtNQUFBLEdBQUEsRUFBSyxHQUFMO01BQ0EsUUFBQSxFQUFTLEtBRFQ7S0FETyxDQUFUO0VBREc7O2tCQUtMLElBQUEsR0FBTSxTQUFDLEdBQUQ7V0FDSixJQUFDLENBQUEsT0FBRCxDQUFTLEtBQUEsQ0FDUDtNQUFBLEdBQUEsRUFBSyxHQUFMO01BQ0EsUUFBQSxFQUFVLE1BRFY7S0FETyxDQUFUO0VBREkiLCJmaWxlIjoicXVlcnkuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBSZWFkZXI6OlF1ZXJ5XG5cbiAgY29uc3RydWN0b3I6IChAb3B0aW9ucyA9IHt9KSAtPlxuXG4gIG1vZGVsID0gKG9wdGlvbnMgPSB7fSkgLT5cbiAgICByZXR1cm4ge1xuICAgICAgdXJsICAgICAgOiBvcHRpb25zLnVybCAgICAgIG9yICcnXG4gICAgICBkYXRhICAgICA6IG9wdGlvbnMuZGF0YSAgICAgb3Ige31cbiAgICAgIGRhdGFUeXBlIDogb3B0aW9ucy5kYXRhVHlwZSBvciAnJ1xuICAgICAgYXN5bmMgICAgOiBvcHRpb25zLmFzeW5jICAgIG9yIHRydWVcbiAgICAgIGNhY2hlICAgIDogb3B0aW9ucy5jYWNoZSAgICBvciB0cnVlXG4gICAgICBoZWFkZXJzICA6IG9wdGlvbnMuaGVhZGVycyAgb3Ige31cbiAgICB9XG5cbiAgcmVxdWVzdDogKG9wdGlvbnMgPSB7fSktPlxuICAgICQuYWpheFxuICAgICAgdXJsICAgICAgOiBvcHRpb25zLnVybFxuICAgICAgZGF0YVR5cGUgOiBvcHRpb25zLmRhdGFUeXBlXG4gICAgICBjYWNoZSAgICA6IG9wdGlvbnMuY2FjaGVcbiAgICAgIGhlYWRlcnMgIDogb3B0aW9ucy5oZWFkZXJzXG5cbiAgeG1sOiAodXJsKS0+XG4gICAgQHJlcXVlc3QgbW9kZWxcbiAgICAgIHVybDogdXJsXG4gICAgICBkYXRhVHlwZToneG1sJ1xuXG4gIGh0bWw6ICh1cmwpLT5cbiAgICBAcmVxdWVzdCBtb2RlbFxuICAgICAgdXJsOiB1cmxcbiAgICAgIGRhdGFUeXBlOiAnaHRtbCdcbiJdfQ==
