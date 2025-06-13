const express = require("express");
const router = express.Router();
// loading middleware
const auth = require(rootPath + "/middleware/auth");
// loading helpers
const { successRespSync, serverError } = require(rootPath + "/helpers/api");
const { error, success } = require(rootPath + "/helpers/language"); // constant messages
const { logErrorOccurred, notEmpty } = require(rootPath + "/helpers/general"); // constant messages
// validations
const validate = require(rootPath + "/helpers/validation");
const validationErrorHandler = require(rootPath +
  "/middleware/validation_error_handler");
// load helper controller
const controller = require(rootPath + "/helpers/controller");
// loading models
const db = require(rootPath + "/models");

/**
 * @desc Add new note for the animal
 */
router.post(
  "/",
  auth,
  validate.note.post(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { animalNumber, title, note } = req.body;
      const set = { userId, animalNumber, title, note };

      const transaction = await db.sequelize.transaction();

      try {
        const animalNotes = await controller.AnimalNote.addNote(
          req,
          set,
          transaction
        );

        req.activity = {
          performedOnId: animalNumber,
          type: "animal",
          action: "NOTE_REG",
          meta: {},
        };
        await controller.ActivityLog.create(req, transaction);

        await transaction.commit();

        // add animal activity log
        await controller.AnimalActivityLog.addActivityLog(req, {
          action: "NOTE_REG",
          animalNumber,
        });

        return res.json(
          successRespSync({
            msg: success.CREATED,
            data: { animalNotes },
          })
        );
      } catch (err) {
        await transaction.rollback();
        logErrorOccurred(__filename, err);
        return serverError(res);
      }
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @desc update note of the animal with note number
 */
router.put(
  "/",
  auth,
  validate.note.put(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { noteNumber, note } = req.body;
      const set = { note };
      const where = { noteNumber };

      await controller.AnimalNote.updateNote(set, where);
      const updatedNote = await controller.AnimalNote.getNote(where);

      req.activity = {
        performedOnId: updatedNote.animalNumber,
        type: "animal",
        action: "NOTE_UPDATE",
        meta: {},
      };
      await controller.ActivityLog.create(req);
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);

      return res.json(
        successRespSync({
          msg: updatedNote !== null ? success.UPDATED : respError.NOT_FOUND,
          data: { note: updatedNote },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

/**
 * @desc fetch list of the notes of the animal
 */
router.get(
  "/:animalNumber",
  auth,
  validate.note.get(),
  validationErrorHandler,
  async (req, res) => {
    try {
      const { animalNumber } = req.params;
      const { search } = req.query;

      let where = { animalNumber };
      // check if search query is not empty
      if (notEmpty(search)) {
        const fields = ["note"];
        const searchQuery = fields.map((col) => {
          return {
            [col]: {
              [db.Sequelize.Op.like]: "%" + search + "%",
            },
          };
        });
        // update where condition
        where = { ...where, [db.Sequelize.Op.or]: searchQuery };
      }

      const animalNotes = await controller.AnimalNote.listAnimalNotes(
        req,
        where
      );
      const language = (req.headers.language && req.headers.language !== '') ? req.headers.language : 'en'
      const { respError } = require(rootPath + "/helpers/response/" + language);

      return res.json(
        successRespSync({
          msg: animalNotes == null ? respError.NOT_FOUND : success.FETCH,
          data: { animalNotes },
        })
      );
    } catch (err) {
      logErrorOccurred(__filename, err);
      return serverError(res);
    }
  }
);

module.exports = router;
