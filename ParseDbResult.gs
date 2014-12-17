var ParseDbResult_ = function(instance, query) {
  // Params.
  this.instance_ = instance;
  this.query_ = query;

  // Builder values.
  this.limit_ = Number.MAX_VALUE;
  this.skip_ = null;
  this.order_ = null;

  // Local results.
  this.results_ = [];

  // Total results fetched so far.
  this.total_ = 0;

  // Current offset.
  this.offset_ = 0;

  // Total number of results that match the query.
  this.count_ = null;

  // If the query has already been executed and can no longer be modified.
  this.locked_ = false;

  // If there are no more results to fetch.
  this.done_ = false;
};

ParseDbResult_.PAGE_SIZE_ = 1000;

ParseDbResult_.prototype.hasNext = function() {
  if (this.results_.length == 0 && !this.done_) {
    this.fetch_();
  }
  return this.results_.length > 0;
};

ParseDbResult_.prototype.next = function() {
  if (!this.hasNext()) {
    throw 'No items left.';
  }
  return this.results_.shift();
};

ParseDbResult_.prototype.getSize = function() {
  this.hasNext();
  if (this.limit_ != Number.MAX_VALUE) {
    return Math.min(this.count_, this.limit_);
  } else if (this.skip_) {
    return this.count_ - this.skip_;
  } else {
    return this.count_;
  }
};

ParseDbResult_.prototype.limit = function(number) {
  if (this.locked_) {
    throw 'Cannot change limit.';
  }
  this.limit_ = number;
  return this;
};

ParseDbResult_.prototype.startAt = function(number) {
  if (this.locked_) {
    throw 'Cannot change start.';
  }
  this.skip_ = number;
  return this;
};

ParseDbResult_.prototype.sortBy = function(fieldPath, opt_direction,
    opt_strategy) {
  if (this.locked_) {
    throw 'Cannot change sorting.';
  }
  if (opt_direction == ParseDbInstance_.prototype.DESCENDING) {
    fieldPath = '-' + fieldPath;
  }
  this.order_ = fieldPath;
  return this;
};

ParseDbResult_.prototype.paginate = function(pageNumber, pageSize) {
  this.limit(pageSize);
  this.startAt(pageSize * pageNumber);
  return this;
};

/**
 * Fetches the next page of results from the Parse API.
 */
ParseDbResult_.prototype.fetch_ = function() {
  if (!this.locked_) {
    this.locked_ = true;
    this.offset_ = this.skip_ || 0;
  }
  var limit = Math.min(ParseDbResult_.PAGE_SIZE_, this.limit_ - this.total_);
  if (limit == 0) {
    this.done_ = true;
    return;
  }
  var params = {
    where: JSON.stringify(this.query_),
    limit: limit,
    skip: this.offset_,
    count:1
  };
  if (this.order_) {
    params.order = this.order_;
  }
  var response = this.instance_.call_({
    params: params
  });
  if (response.results.length == 0) {
    this.done_ = true;
  } else {
    this.total_ += response.results.length;
    var items = response.results.map(function(item) {
      return new ParseDbMap_(item);
    });
    this.results_ = this.results_.concat(items);
  }
  this.count_ = response.count;
  this.offset_ += limit;
}
