import { NativePlayer } from "./native";
import { ISource } from "./types";

const videoLoadMock = vi.fn();

describe("native player", () => {
  test("init", () => {
    const native = new NativePlayer({} as any);
    const video = document.createElement("video");
    const source: ISource = {
      url: "https://test.com",
    };

    native.init(video, source);

    expect(video.src).toBe("https://test.com");
  });

  test("destroy", () => {
    const native = new NativePlayer({
      videoElement: {
        src: "https://test.com",
        load: videoLoadMock,
      },
    } as any);

    native.destroy();

    expect(videoLoadMock).toBeCalled();
  });
});
