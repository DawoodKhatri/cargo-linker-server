import {
  ref,
  uploadBytes,
  deleteObject,
  getDownloadURL,
} from "firebase/storage";
import storage from "../config/firebase.js";
import path from "path";
import { v4 } from "uuid";

export const uploadFile = async (folder, file) => {
  const name = v4();
  const fileName = name + path.extname(file.originalname);
  const imageRef = ref(storage, `${folder}/${fileName}`);
  const uploadPath = (
    await uploadBytes(imageRef, file.buffer, { contentType: file.mimetype })
  ).ref.fullPath;
  return uploadPath;
};

export const deleteFile = async (filePath) => {
  const storageRef = ref(storage, filePath);
  await deleteObject(storageRef);
};

export const getFileUrl = async (filePath) => {
  const storageRef = ref(storage, filePath);
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
};
