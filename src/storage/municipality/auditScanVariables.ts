export const auditScanVariables = {
  min: {
    "municipality-ux-ui-consistency-bootstrap-italia-double-check": {
      numberOfFirstLevelPageToBeScanned: 1,
      numberOfSecondLevelPageToBeScanned: 1,
      numberOfServicesToBeScanned: 1,
    },
    "municipality-legislation-cookie-domain-check": {
      numberOfFirstLevelPageToBeScanned: 1,
      numberOfSecondLevelPageToBeScanned: 1,
      numberOfServicesToBeScanned: 1,
      numberOfEventsToBeScanned: 1,
    },
    "municipality-servizi-structure-match-model": {
      numberOfServicesToBeScanned: 1,
    },
  },
  suggested: {
    "municipality-ux-ui-consistency-bootstrap-italia-double-check": {
      numberOfFirstLevelPageToBeScanned: 5,
      numberOfSecondLevelPageToBeScanned: 5,
      numberOfServicesToBeScanned: 5,
    },
    "municipality-legislation-cookie-domain-check": {
      numberOfFirstLevelPageToBeScanned: 5,
      numberOfSecondLevelPageToBeScanned: 5,
      numberOfServicesToBeScanned: 5,
      numberOfEventsToBeScanned: 5,
    },
    "municipality-servizi-structure-match-model": {
      numberOfServicesToBeScanned: 5,
    },
  },
  high: {
    "municipality-ux-ui-consistency-bootstrap-italia-double-check": {
      numberOfFirstLevelPageToBeScanned: 10,
      numberOfSecondLevelPageToBeScanned: 10,
      numberOfServicesToBeScanned: 10,
    },
    "municipality-legislation-cookie-domain-check": {
      numberOfFirstLevelPageToBeScanned: 10,
      numberOfSecondLevelPageToBeScanned: 10,
      numberOfServicesToBeScanned: 10,
      numberOfEventsToBeScanned: 10,
    },
    "municipality-servizi-structure-match-model": {
      numberOfServicesToBeScanned: 10,
    },
  },
  all: {
    "municipality-ux-ui-consistency-bootstrap-italia-double-check": {
      numberOfFirstLevelPageToBeScanned: -1,
      numberOfSecondLevelPageToBeScanned: -1,
      numberOfServicesToBeScanned: -1,
    },
    "municipality-legislation-cookie-domain-check": {
      numberOfFirstLevelPageToBeScanned: -1,
      numberOfSecondLevelPageToBeScanned: -1,
      numberOfServicesToBeScanned: -1,
      numberOfEventsToBeScanned: -1,
    },
    "municipality-servizi-structure-match-model": {
      numberOfServicesToBeScanned: -1,
    },
  },
};
