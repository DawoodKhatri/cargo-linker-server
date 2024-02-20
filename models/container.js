import { Schema, model } from "mongoose";
import { CONTAINER_SIZES, CONTAINER_TYPES } from "../constants/company.js";

const { String } = Schema.Types;

const containerSchema = new Schema(
  {
    containerId: { type: String, required: true },
    type: { type: String, enum: CONTAINER_TYPES, required: true },
    size: { type: Number, enum: CONTAINER_SIZES, required: true },
    due: { type: Date, required: true },
    dimension: {
      length: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
    },
    price: { type: Number, required: true },
    pickup: {
      lat: { type: Number, required: true },
      long: { type: Number, required: true },
    },
    drop: {
      lat: { type: Number, required: true },
      long: { type: Number, required: true },
    },
  },
  { versionKey: false }
);

const Container = model("Container", containerSchema);

export default Container;
