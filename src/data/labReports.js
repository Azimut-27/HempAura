/**
 * @typedef {Object} LabReport
 * @property {string} id
 * @property {string} productId
 * @property {string} batchNumber
 * @property {string} laboratoryName
 * @property {string} testedAt
 * @property {string|null} documentUrl
 * @property {"available"|"pending"|"withdrawn"} status
 * @property {string} summary
 */

/** @type {LabReport[]} */
export const labReports = [
  // TODO(owner): add only genuine reports with working document URLs.
];
