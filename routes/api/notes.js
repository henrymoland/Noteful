const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Note = require('../../models/Note');
const User= require('../../models/User');

// @route   POST api/notes
// @desc    Create a note
router.post('/', [ auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('text', "you can't save an empty note").not().isEmpty() ]
], 
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: error.array() });
    }

    try {
        const user = await User.findById(req.user.id).select('-password');

        const newNote = new Note({
            title: req.body.title,
            text: req.body.text,
            user: req.user.id
        })

        const note =  await newNote.save();

        res.json(note);
    } catch {
        console.error(err.message);
        res.status(500).send('Server error');
    }
    
});

// @route   GET api/notes
// @desc    Get list of notes
router.get('/', async (req, res) => {
    
    try {
        const notes = await Note.find().sort({ date: -1 });
        res.json(notes);
    } catch {
        console.error(err.message);
        res.status(500).send('Server error');
    }
    
});

// @route   GET api/notes
// @desc    Get note by Id
router.get('/:id', auth, async (req, res) => {
    
    try {
        const note = await Note.findById(req.params.id);
        if(!note) {
            return res.status(404).json({ msg: 'Note not found' })
        }
        res.json(note);
    } catch(err) {
        console.error(err.message);
        if(err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Note not found' })
        }
        res.status(500).send('Server error');
    }
    
});

// @route   Delete api/notes
// @desc    Delete note by Id
router.delete('/:id', auth, async (req, res) => {
    
    try {
        const note = await Note.findById(req.params.id);
        
        // Check if note exist
        if(!note) {
            return res.status(404).json({ msg: 'Note not found' })
        }

        // Check if user created note
        if(note.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'You can only delete notes you created' });
        }
        
        await note.remove();

        res.json({ msg: 'Note deleted' });
    } catch(err) {
        console.error(err.message);
        if(err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Note not found' })
        }
        res.status(500).send('Server error');
    }
    
});

module.exports = router;