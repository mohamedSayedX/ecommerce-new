class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  filter() {
    const queryStringObject = {...this.queryString};

    const excludesFields = ["page", "sort", "limit", "fields", "keyword"];
    excludesFields.forEach((field) => delete queryStringObject[field]);
    //APPLY filteratio usgin [gte , gt , lte , lt]
    let queryStr = JSON.stringify(queryStringObject);
    console.log("query.before", queryStr);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      // Sort by createdAt by default in descending order
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }

    return this;
  }

  search(modelName) {
    if (this.queryString.keyword) {
      let query = {};
      if (modelName == "products") {
        query.$or = [
          {title: {$regex: this.queryString.keyword, $options: "i"}},
          {description: {$regex: this.queryString.keyword, $options: "i"}},
        ];
      } else {
        query.$or = [{name: {$regex: this.queryString.keyword, $options: "i"}}];
      }

      this.mongooseQuery = this.mongooseQuery.find(query); // Apply the query
    }

    return this;
  }

  paginate(countDocuments) {
    const page = +this.queryString.page * 1 || 1;
    const limit = +this.queryString.limit * 1 || 50;
    const skip = (page - 1) * limit; // (2-1) * 5 = 5
    const endIndex = page * limit; //2(page) * 10(limit) => end index of page number 2 is 20
    const pagination = {};

    pagination.currentPage = page;
    pagination.limit = limit;
    pagination.numberOfPages = Math.ceil(countDocuments / limit); // 50/10  = 0.2 ==>

    // next page ==>
    if (endIndex < countDocuments) {
      pagination.next = page + 1;
    }

    // previous page ==>
    if (skip > 0) {
      pagination.prev = page - 1;
    }

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    this.paginateResult = pagination;
    return this;
  }
}

module.exports = ApiFeatures;
