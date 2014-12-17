var ParseDbMap_ = function(data) {
  var self = this;
  Object.keys(data).forEach(function(key) {
    self[key] = data[key];
  });
};

ParseDbMap_.prototype.getId = function() {
  return this.objectId;
};

ParseDbMap_.prototype.toJson = function() {
  return JSON.stringify(this);
};
