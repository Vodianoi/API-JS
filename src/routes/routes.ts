import express from "express";
import {getFolder, postFolder, putFile, deleteFile} from "./app";

const router = express.Router();


router.get('/', getFolder)

router.get('/*', getFolder)

router.post('/*', postFolder)
router.post('/', postFolder)

router.put('/*', putFile)
router.put('/', putFile)

router.delete('/*/:name', deleteFile)
router.delete('/:name', deleteFile)

export default router;