const { file } = require("@babel/types");
const {
  convertTimestampToDate,
  createRef,
  formatComments,
  paginateArray,
  filterQueryUpdate,
} = require("../db/utils");

describe("convertTimestampToDate", () => {
  test("returns a new object", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result).not.toBe(input);
    expect(result).toBeObject();
  });
  test("converts a created_at property to a date", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result.created_at).toBeDate();
    expect(result.created_at).toEqual(new Date(timestamp));
  });
  test("does not mutate the input", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    convertTimestampToDate(input);
    const control = { created_at: timestamp };
    expect(input).toEqual(control);
  });
  test("ignores includes any other key-value-pairs in returned object", () => {
    const input = { created_at: 0, key1: true, key2: 1 };
    const result = convertTimestampToDate(input);
    expect(result.key1).toBe(true);
    expect(result.key2).toBe(1);
  });
  test("returns unchanged object if no created_at property", () => {
    const input = { key: "value" };
    const result = convertTimestampToDate(input);
    const expected = { key: "value" };
    expect(result).toEqual(expected);
  });
});

describe("createRef", () => {
  test("returns an empty object, when passed an empty array", () => {
    const input = [];
    const actual = createRef(input);
    const expected = {};
    expect(actual).toEqual(expected);
  });
  test("returns a reference object when passed an array with a single items", () => {
    const input = [{ title: "title1", article_id: 1, name: "name1" }];
    let actual = createRef(input, "title", "article_id");
    let expected = { title1: 1 };
    expect(actual).toEqual(expected);
    actual = createRef(input, "name", "title");
    expected = { name1: "title1" };
    expect(actual).toEqual(expected);
  });
  test("returns a reference object when passed an array with many items", () => {
    const input = [
      { title: "title1", article_id: 1 },
      { title: "title2", article_id: 2 },
      { title: "title3", article_id: 3 },
    ];
    const actual = createRef(input, "title", "article_id");
    const expected = { title1: 1, title2: 2, title3: 3 };
    expect(actual).toEqual(expected);
  });
  test("does not mutate the input", () => {
    const input = [{ title: "title1", article_id: 1 }];
    const control = [{ title: "title1", article_id: 1 }];
    createRef(input);
    expect(input).toEqual(control);
  });
});

describe("formatComments", () => {
  test("returns an empty array, if passed an empty array", () => {
    const comments = [];
    expect(formatComments(comments, {})).toEqual([]);
    expect(formatComments(comments, {})).not.toBe(comments);
  });
  test("converts created_by key to author", () => {
    const comments = [{ created_by: "ant" }, { created_by: "bee" }];
    const formattedComments = formatComments(comments, {});
    expect(formattedComments[0].author).toEqual("ant");
    expect(formattedComments[0].created_by).toBe(undefined);
    expect(formattedComments[1].author).toEqual("bee");
    expect(formattedComments[1].created_by).toBe(undefined);
  });
  test("replaces belongs_to value with appropriate id when passed a reference object", () => {
    const comments = [{ belongs_to: "title1" }, { belongs_to: "title2" }];
    const ref = { title1: 1, title2: 2 };
    const formattedComments = formatComments(comments, ref);
    expect(formattedComments[0].article_id).toBe(1);
    expect(formattedComments[1].article_id).toBe(2);
  });
  test("converts created_at timestamp to a date", () => {
    const timestamp = Date.now();
    const comments = [{ created_at: timestamp }];
    const formattedComments = formatComments(comments, {});
    expect(formattedComments[0].created_at).toEqual(new Date(timestamp));
  });
});

describe("paginateArray", () => {
  it("should take an array and return a new array with the all the items when not supplied a limit or page", () => {
    const input = [1,2,3,4,5,6,7,8,9,10,11,12]
    const actual = paginateArray(input)
    expect(actual).toEqual(input)
    expect(actual).not.toBe(input)
  })
  it("should return the first return the first 5 items when supplied a limit of 5 and no page", () => {
    const input = [1,2,3,4,5,6,7,8,9,10]
    const actual = paginateArray(input,5)
    expect(actual).toEqual([1,2,3,4,5])
  })
  it("should return the first return the first 10 items when supplied no limit and page number one (i.e. limit defaults to 10)", () => {
    const input = [1,2,3,4,5,6,7,8,9,10,11,12]
    const actual = paginateArray(input,undefined,1)
    expect(actual).toEqual([1,2,3,4,5,6,7,8,9,10])
  })
  it("should return the first return the 3rd and 4th items when supplied a limit of two and page number two", () => {
    const input = [1,2,3,4,5,6,7,8,9,10,11,12]
    const actual = paginateArray(input,2,2)
    expect(actual).toEqual([3,4])
  })
})

describe("filter query creation function", () => {
  it("should return the supplied query and array when the supplied filter value is undefined", () => {
    const queryString = `SELECT CAST(COUNT(articles.article_id) AS INT) FROM articles`
    const actual = filterQueryUpdate('topic',undefined,queryString,[])
    expect(actual.queryString).toBe(queryString)
    expect(actual.queryVals).toEqual([])
  })
  it("should update the supplied query and empty vals array with the defined filter and value", () => {
    const queryString = `SELECT CAST(COUNT(articles.article_id) AS INT) FROM articles`
    const actual = filterQueryUpdate('topic','mitch',queryString,[])
    expect(actual.queryString).toBe('SELECT CAST(COUNT(articles.article_id) AS INT) FROM articles WHERE topic = $1')
    expect(actual.queryVals).toEqual(['mitch'])
  })
  it("should update accept a boolean of true to supply the original query wrapped in a sub query string", () => {
    const queryString = `SELECT CAST(COUNT(articles.article_id) AS INT) FROM articles`
    const actual = filterQueryUpdate('topic','mitch',queryString,[],true)
    expect(actual.queryString).toBe('SELECT * FROM (SELECT CAST(COUNT(articles.article_id) AS INT) FROM articles) a WHERE topic = $1')
    expect(actual.queryVals).toEqual(['mitch'])
  })
  it("should update the supplied query using the next dollar value and add vals to an array with the defined filter and value", () => {
    const queryString = `SELECT CAST(COUNT(articles.article_id) AS INT) FROM articles`
    const actual = filterQueryUpdate('topic','mitch',queryString,['paul'])
    expect(actual.queryString).toBe('SELECT CAST(COUNT(articles.article_id) AS INT) FROM articles WHERE topic = $2')
    expect(actual.queryVals).toEqual(['paul','mitch'])
  })
  it("should not mutate the supplied array",() => {
    const queryString = `SELECT CAST(COUNT(articles.article_id) AS INT) FROM articles`
    const inputArr = ['paul']
    const copyInputArr = ['paul']
    filterQueryUpdate('topic','mitch',queryString,inputArr)
    expect(inputArr).toEqual(copyInputArr)
  })
})