import express from "express";
import {handleGet, handlePost, handlePut, handleDelete} from "./app";

const router = express.Router();

router.get('/?*', handleGet)

router.post('/?*', handlePost)

router.put('/?*', handlePut)

router.delete('/?*', handleDelete)

export default router;