const fs = require("fs");

const parseCodeQl = async (path) => {
  const data = await fs.promises.readFile(path, "utf8");
  const sarif = JSON.parse(data);

  const rules = {};
  sarif.runs[0].tool.driver.rules.forEach((rule) => {
    const ruleObject = {
      id: rule.id,
      shortDescription: rule.shortDescription.text,
      fullDescription: rule.fullDescription.text,
      tags: rule.properties.tags,
      confidence: rule.properties.precision,
      cvss: Number(rule.properties["security-severity"]),
      problemSeverity: rule.properties["problem.severity"],
    };
    rules[rule.id] = ruleObject;
  });

  const results = [];
  sarif.runs[0].results.forEach((result) => {
    const resultObject = {
      rule: rules[result.ruleId],
      detail: result.message.text,
      location: `${result.locations[0].physicalLocation.artifactLocation.uri}: ${result.locations[0].physicalLocation.region.startLine}: ${result.locations[0].physicalLocation.region.startColumn}:${result.locations[0].physicalLocation.region.endColumn}`,
    };
    results.push(resultObject);
  });

  return results;
};

module.exports = parseCodeQl;
