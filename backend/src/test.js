const path = require("path")
const codeqlParser = require("./utils/codeqlParser")

codeqlParser(path.join(__dirname, "../../codeql-output/juice-shop-2024-06-08.sarif"));