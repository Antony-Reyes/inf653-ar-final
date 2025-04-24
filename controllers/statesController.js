const State = require('../model/State');
const statesData = require('../model/statesData.json');

// Helper function to find state data
const findState = (stateCode) => {
    return statesData.find(state => state.code === stateCode.toUpperCase());
};

// GET all states (with optional contig filter)
const getAllStates = async (req, res) => {
    let statesList = [...statesData];
    
    // Apply contig filter if specified
    if (req.query?.contig === 'true') {
        statesList = statesList.filter(state => state.code !== 'AK' && state.code !== 'HI');
    } else if (req.query?.contig === 'false') {
        statesList = statesList.filter(state => state.code === 'AK' || state.code === 'HI');
    }

    // Add fun facts from MongoDB to each state
    const statesWithFacts = await Promise.all(statesList.map(async (state) => {
        const stateInDb = await State.findOne({ stateCode: state.code }).exec();
        return {
            ...state,
            funfacts: stateInDb?.funfacts || []
        };
    }));

    res.json(statesWithFacts);
};

// GET specific state by code
const getState = async (req, res) => {
    if (!req?.params?.state) {
        return res.status(400).json({ 'message': 'State code required.' });
    }

    const stateCode = req.params.state.toUpperCase();
    const stateData = findState(stateCode);
    
    if (!stateData) {
        return res.status(404).json({ 'message': 'Invalid state abbreviation parameter' });
    }

    // Get fun facts from MongoDB
    const stateInDb = await State.findOne({ stateCode: stateCode }).exec();
    
    const result = {
        ...stateData,
        funfacts: stateInDb?.funfacts || []
    };
    
    res.json(result);
};

// GET a random fun fact for a state
const getStateFunFact = async (req, res) => {
    if (!req?.params?.state) {
        return res.status(400).json({ 'message': 'State code required.' });
    }

    const stateCode = req.params.state.toUpperCase();
    const stateData = findState(stateCode);
    
    if (!stateData) {
        return res.status(404).json({ 'message': 'Invalid state abbreviation parameter' });
    }

    // Get fun facts from MongoDB
    const stateInDb = await State.findOne({ stateCode: stateCode }).exec();
    
    if (!stateInDb || !stateInDb.funfacts || stateInDb.funfacts.length === 0) {
        return res.status(404).json({ 
            'message': `No Fun Facts found for ${stateData.state}` 
        });
    }

    // Get a random fun fact
    const randomIndex = Math.floor(Math.random() * stateInDb.funfacts.length);
    
    res.json({ funfact: stateInDb.funfacts[randomIndex] });
};

// GET state capital
const getStateCapital = async (req, res) => {
    if (!req?.params?.state) {
        return res.status(400).json({ 'message': 'State code required.' });
    }

    const stateCode = req.params.state.toUpperCase();
    const stateData = findState(stateCode);
    
    if (!stateData) {
        return res.status(404).json({ 'message': 'Invalid state abbreviation parameter' });
    }

    res.json({
        state: stateData.state,
        capital: stateData.capital_city
    });
};

// GET state nickname
const getStateNickname = async (req, res) => {
    if (!req?.params?.state) {
        return res.status(400).json({ 'message': 'State code required.' });
    }

    const stateCode = req.params.state.toUpperCase();
    const stateData = findState(stateCode);
    
    if (!stateData) {
        return res.status(404).json({ 'message': 'Invalid state abbreviation parameter' });
    }

    res.json({
        state: stateData.state,
        nickname: stateData.nickname
    });
};

// GET state population
const getStatePopulation = async (req, res) => {
    if (!req?.params?.state) {
        return res.status(400).json({ 'message': 'State code required.' });
    }

    const stateCode = req.params.state.toUpperCase();
    const stateData = findState(stateCode);
    
    if (!stateData) {
        return res.status(404).json({ 'message': 'Invalid state abbreviation parameter' });
    }

    res.json({
        state: stateData.state,
        population: stateData.population.toLocaleString()
    });
};

// GET state admission date
const getStateAdmission = async (req, res) => {
    if (!req?.params?.state) {
        return res.status(400).json({ 'message': 'State code required.' });
    }

    const stateCode = req.params.state.toUpperCase();
    const stateData = findState(stateCode);
    
    if (!stateData) {
        return res.status(404).json({ 'message': 'Invalid state abbreviation parameter' });
    }

    res.json({
        state: stateData.state,
        admitted: stateData.admission_date
    });
};

// POST - Add fun facts for a state
const createStateFunFact = async (req, res) => {
    if (!req?.params?.state) {
        return res.status(400).json({ 'message': 'State code required.' });
    }

    if (!req?.body?.funfacts) {
        return res.status(400).json({ 'message': 'State fun facts value required' });
    }

    if (!Array.isArray(req.body.funfacts)) {
        return res.status(400).json({ 'message': 'State fun facts value must be an array' });
    }

    const stateCode = req.params.state.toUpperCase();
    const stateData = findState(stateCode);
    
    if (!stateData) {
        return res.status(404).json({ 'message': 'Invalid state abbreviation parameter' });
    }

    try {
        // Check if state already exists in MongoDB
        const stateExists = await State.findOne({ stateCode: stateCode }).exec();
        
        let result;
        if (stateExists) {
            // Add to existing fun facts
            stateExists.funfacts = [...stateExists.funfacts, ...req.body.funfacts];
            result = await stateExists.save();
        } else {
            // Create new state entry
            result = await State.create({
                stateCode: stateCode,
                funfacts: req.body.funfacts
            });
        }

        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Server error' });
    }
};

// PATCH - Update a fun fact
const updateStateFunFact = async (req, res) => {
    if (!req?.params?.state) {
        return res.status(400).json({ 'message': 'State code required.' });
    }

    if (!req?.body?.index) {
        return res.status(400).json({ 'message': 'State fun fact index value required' });
    }

    if (!req?.body?.funfact) {
        return res.status(400).json({ 'message': 'State fun fact value required' });
    }

    const stateCode = req.params.state.toUpperCase();
    const stateData = findState(stateCode);
    
    if (!stateData) {
        return res.status(404).json({ 'message': 'Invalid state abbreviation parameter' });
    }

    // Get state from MongoDB
    const stateInDb = await State.findOne({ stateCode: stateCode }).exec();
    
    if (!stateInDb || !stateInDb.funfacts || stateInDb.funfacts.length === 0) {
        return res.status(404).json({ 
            'message': `No Fun Facts found for ${stateData.state}` 
        });
    }

    // Adjust index (1-based to 0-based)
    const adjustedIndex = req.body.index - 1;
    
    if (adjustedIndex < 0 || adjustedIndex >= stateInDb.funfacts.length) {
        return res.status(400).json({ 
            'message': `No Fun Fact found at that index for ${stateData.state}` 
        });
    }

    // Update the fun fact
    stateInDb.funfacts[adjustedIndex] = req.body.funfact;
    const result = await stateInDb.save();
    
    res.json(result);
};

// DELETE - Remove a fun fact
const deleteStateFunFact = async (req, res) => {
    if (!req?.params?.state) {
        return res.status(400).json({ 'message': 'State code required.' });
    }

    if (!req?.body?.index) {
        return res.status(400).json({ 'message': 'State fun fact index value required' });
    }

    const stateCode = req.params.state.toUpperCase();
    const stateData = findState(stateCode);
    
    if (!stateData) {
        return res.status(404).json({ 'message': 'Invalid state abbreviation parameter' });
    }

    // Get state from MongoDB
    const stateInDb = await State.findOne({ stateCode: stateCode }).exec();
    
    if (!stateInDb || !stateInDb.funfacts || stateInDb.funfacts.length === 0) {
        return res.status(404).json({ 
            'message': `No Fun Facts found for ${stateData.state}` 
        });
    }

    // Adjust index (1-based to 0-based)
    const adjustedIndex = req.body.index - 1;
    
    if (adjustedIndex < 0 || adjustedIndex >= stateInDb.funfacts.length) {
        return res.status(400).json({ 
            'message': `No Fun Fact found at that index for ${stateData.state}` 
        });
    }

    // Remove the fun fact
    stateInDb.funfacts.splice(adjustedIndex, 1);
    const result = await stateInDb.save();
    
    res.json(result);
};

module.exports = {
    getAllStates,
    getState,
    getStateFunFact,
    getStateCapital,
    getStateNickname,
    getStatePopulation,
    getStateAdmission,
    createStateFunFact,
    updateStateFunFact,
    deleteStateFunFact
};