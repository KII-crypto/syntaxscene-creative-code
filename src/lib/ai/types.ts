/**
 * Shared contracts for SyntaxScene generation services.
 *
 * These types are deliberately provider-agnostic. Any independent /
 * open-source model (local ComfyUI, Automatic1111, a self-hosted
 * inference server, etc.) can be plugged in behind them without the UI
 * changing at all.
 */

export type ImageRequest = {
  prompt: string;
};

export type ImageResult = {
  /** Data URL or absolute URL of the generated image. */
  url: string;
};

export type VideoRequest = {
  prompt: string;
  /** Data URL of the source image to animate. */
  image: string;
};

export type VideoResult = {
  /** Data URL or absolute URL of the generated video. */
  url: string;
};

export type ProviderStatus = {
  configured: boolean;
  name: string;
  message: string;
};

export class ProviderNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderNotConfiguredError";
  }
}
