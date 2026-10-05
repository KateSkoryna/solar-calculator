// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

import { TextDecoder, TextEncoder } from "node:util";

Object.assign(globalThis, { TextDecoder, TextEncoder });

HTMLCanvasElement.prototype.getContext = () => null;
