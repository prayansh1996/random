const express = require('express');
const router = express.Router();

// Default grid values for Sumplete puzzle
const defaultGridValues = [
    [9, 4, 4, 8, 7, 5, 3],
    [2, 2, 8, 4, 7, 7, 5],
    [3, 4, 7, 3, 4, 1, 1],
    [6, 6, 4, 8, 3, 8, 1],
    [4, 2, 2, 5, 9, 7, 3],
    [9, 7, 5, 9, 8, 5, 4],
    [1, 6, 5, 6, 9, 6, 3]
];

const defaultRowTotals = [33, 28, 8, 20, 21, 33, 21];
const defaultColTotals = [27, 19, 21, 21, 43, 24, 9];

router.get('/', (req, res) => {
    res.render('sumplete', {
        gridValues: defaultGridValues,
        rowTotals: defaultRowTotals,
        colTotals: defaultColTotals
    });
});

module.exports = router;