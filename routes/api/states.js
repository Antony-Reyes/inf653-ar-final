const express = require('express');
const router = express.Router();
const statesController = require('../../controllers/statesController');

// Main states routes
router.route('/')
    .get(statesController.getAllStates);

// State routes by state code
router.route('/:state')
    .get(statesController.getState);

// Fun facts routes
router.route('/:state/funfact')
    .get(statesController.getStateFunFact)
    .post(statesController.createStateFunFact)
    .patch(statesController.updateStateFunFact)
    .delete(statesController.deleteStateFunFact);

// Other state info routes
router.route('/:state/capital')
    .get(statesController.getStateCapital);

router.route('/:state/nickname')
    .get(statesController.getStateNickname);

router.route('/:state/population')
    .get(statesController.getStatePopulation);

router.route('/:state/admission')
    .get(statesController.getStateAdmission);

module.exports = router;