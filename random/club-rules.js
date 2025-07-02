const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Path to the club rules partial
const CLUB_RULES_PATH = path.join(__dirname, 'views', 'partials', 'club_rules.ejs');

// Display the editor page
router.get('/editor', async (req, res) => {
    try {
        // Read the current content of the club rules file
        const content = await fs.readFile(CLUB_RULES_PATH, 'utf8');
        
        // Determine the base URL based on the request path
        const baseUrl = req.baseUrl.includes('/random') ? '/random' : '';
        
        res.render('club-rules-editor', { 
            baseUrl, 
            content,
            success: req.query.success === 'true',
            error: null
        });
    } catch (error) {
        console.error('Error reading club rules:', error);
        const baseUrl = req.baseUrl.includes('/random') ? '/random' : '';
        res.render('club-rules-editor', {
            baseUrl,
            content: '',
            success: false,
            error: 'Failed to load club rules content'
        });
    }
});

// Update the club rules content
router.post('/editor', express.urlencoded({ extended: true }), async (req, res) => {
    try {
        const { content } = req.body;
        
        if (!content) {
            throw new Error('No content provided');
        }
        
        // Write the updated content to the file
        await fs.writeFile(CLUB_RULES_PATH, content, 'utf8');
        
        // Redirect back to the editor with success message
        const baseUrl = req.baseUrl.includes('/random') ? '/random' : '';
        res.redirect(`${baseUrl}/random/club-rules/editor?success=true`);
    } catch (error) {
        console.error('Error updating club rules:', error);
        
        // Render the editor with error message
        const baseUrl = req.baseUrl.includes('/random') ? '/random' : '';
        res.render('club-rules-editor', {
            baseUrl,
            content: req.body.content || '',
            success: false,
            error: 'Failed to save club rules: ' + error.message
        });
    }
});

module.exports = router;