export const auditScanVariables = {
  min: {
    "school-legislation-cookie-domain-check": {
      numberOfFirstLevelPageToBeScanned: 1,
      numberOfSecondLevelPageToBeScanned: 1,
      numberOfServicesToBeScanned: 1,
      numberOfLocationsToBeScanned: 1,
    },
    "school-servizi-structure-match-model": {
      numberOfServicesToBeScanned: 1,
    },
  },
  suggested: {
    "school-legislation-cookie-domain-check": {
      numberOfFirstLevelPageToBeScanned: 3,
      numberOfSecondLevelPageToBeScanned: 3,
      numberOfServicesToBeScanned: 3,
      numberOfLocationsToBeScanned: 3,
    },
    "school-servizi-structure-match-model": {
      numberOfServicesToBeScanned: 3,
    },
  },
  max: {
    "school-legislation-cookie-domain-check": {
      numberOfFirstLevelPageToBeScanned: 10,
      numberOfSecondLevelPageToBeScanned: 10,
      numberOfServicesToBeScanned: 10,
      numberOfLocationsToBeScanned: 10,
    },
    "school-servizi-structure-match-model": {
      numberOfServicesToBeScanned: 10,
    },
  },
};
