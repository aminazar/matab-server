/**
 * Created by Amin on 04/02/2017.
 */
const User = require('./user.model');
const Patient = require('./patient.model');
const Visit = require('./visit.model');
const Document = require('./document.model');
const Waiting = require('./waiting.model');
const helpers = require('./helpers');

module.exports = {
  User: User,
  Patient: Patient,
  Visit: Visit,
  Document: Document,
  Waiting: Waiting,
  helpers: helpers,
};
