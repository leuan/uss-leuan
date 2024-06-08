const fs = require("fs");

const parseCodeQl = async (path) => {
  const data = await fs.promises.readFile(path, "utf8");
  const report = JSON.parse(data);

  const dependencies = [];
  report.dependencies.forEach((dependency) => {
    if (dependency.vulnerabilities) {
      let dependencyObject = {
        name: dependency.evidenceCollected.productEvidence[0].value,
        vendor: dependency.evidenceCollected.vendorEvidence[0].value,
        version: dependency.evidenceCollected.versionEvidence[0].value,
        vulnerabilities: [],
      };

      dependency.vulnerabilities.forEach((vulnerability) => {
        const vulnerabilityObject = {
          source: vulnerability.source,
          name: vulnerability.name,
          description: vulnerability.description,
          notes: vulnerability.notes,
          cvss2: vulnerability.cvssv2.score,
          cvss3: vulnerability.cvssv3.baseScore,
        };
        dependencyObject.vulnerabilities.push(vulnerabilityObject);
      });

      dependencies.push(dependencyObject);
    }

  });
  
  return dependencies;
};

module.exports = parseCodeQl;
