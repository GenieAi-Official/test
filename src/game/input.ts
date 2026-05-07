import type { InputSnapshot } from "@/game/types";

type KeyState = {
  down: Set<string>;
  justPressed: Set<string>;
};

const P1 = {
  left: "KeyA",
  right: "KeyD",
  block: "KeyW",
  attack: "KeyF",
} as const;

const P2 = {
  left: "ArrowLeft",
  right: "ArrowRight",
  block: "ArrowUp",
  attack: "Slash",
} as const;

export type KeyboardInput = {
  attach: () => void;
  detach: () => void;
  snapshot: () => InputSnapshot;
};

export function createKeyboardInput(): KeyboardInput {
  const state: KeyState = { down: new Set(), justPressed: new Set() };

  const onBlur = () => {
    state.down.clear();
    state.justPressed.clear();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const code = e.code;
    if (
      code === P2.left ||
      code === P2.right ||
      code === P2.block ||
      code === P2.attack
    ) {
      e.preventDefault();
    }

    if (!state.down.has(code)) {
      state.justPressed.add(code);
    }
    state.down.add(code);
  };

  const onKeyUp = (e: KeyboardEvent) => {
    state.down.delete(e.code);
  };

  const attach = () => {
    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
  };

  const detach = () => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onBlur);
  };

  const snapshot = (): InputSnapshot => {
    const snap: InputSnapshot = {
      p1: {
        left: state.down.has(P1.left),
        right: state.down.has(P1.right),
        block: state.down.has(P1.block),
        attackPressed: state.justPressed.has(P1.attack),
      },
      p2: {
        left: state.down.has(P2.left),
        right: state.down.has(P2.right),
        block: state.down.has(P2.block),
        attackPressed: state.justPressed.has(P2.attack),
      },
    };

    state.justPressed.clear();
    return snap;
  };

  return { attach, detach, snapshot };
}
