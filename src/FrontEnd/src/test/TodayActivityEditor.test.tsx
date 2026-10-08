/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ComponentProps } from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TodayActivityEditor } from "../components/TodayActivityEditor";
import { ToastContainer } from "../components/Toast";
import { ToastProvider } from "../hooks/useToast";
import { DailyActivity } from "../types";

const EXISTING_ACTIVITY: DailyActivity = {
  day: "2026-09-19",
  errors_reported: 4,
  incidents_created: 2,
  feai: ["INC000000001"],
  status: "pending",
  ko_reason: null,
};

vi.mock("../services/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/api")>();
  return {
    ...actual,
    protabApi: {
      ...actual.protabApi,
      createActivity: vi.fn().mockResolvedValue(undefined),
      updateActivity: vi.fn().mockResolvedValue(undefined),
    },
  };
});

import { protabApi, ApiError } from "../services/api";

const mockedCreate = vi.mocked(protabApi.createActivity);
const mockedUpdate = vi.mocked(protabApi.updateActivity);

describe("TodayActivityEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const expectCalledAfterDebounce = async (fn: ReturnType<typeof vi.fn>) => {
    await waitFor(() => expect(fn).toHaveBeenCalled(), { timeout: 3000 });
  };

  const renderEditor = (props: ComponentProps<typeof TodayActivityEditor>) =>
    render(
      <ToastProvider>
        <TodayActivityEditor {...props} />
        <ToastContainer />
      </ToastProvider>,
    );

  it('affiche les champs et l\'état "en attente" sans activité', () => {
    renderEditor({
      scopeId: "scope-1",
      day: "2026-09-19",
      initialActivity: null,
    });

    expect(
      screen.getByLabelText("Erreurs signalées du jour"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Incidents créés aujourd'hui"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Ajouter une référence FEAI"),
    ).toBeInTheDocument();
  });

  it("pré-remplit les valeurs en mode édition", () => {
    renderEditor({
      scopeId: "scope-1",
      day: "2026-09-19",
      initialActivity: EXISTING_ACTIVITY,
    });

    expect(screen.getByLabelText("Erreurs signalées du jour")).toHaveValue(4);
    expect(screen.getByLabelText("Incidents créés aujourd'hui")).toHaveValue(2);
    expect(screen.getByText("INC000000001")).toBeInTheDocument();
  });

  it("crée une activité (POST) à la première saisie sans relevé", async () => {
    const onChanged = vi.fn();
    renderEditor({
      scopeId: "scope-1",
      day: "2026-09-19",
      initialActivity: null,
      onChanged: onChanged,
    });

    fireEvent.change(screen.getByLabelText("Erreurs signalées du jour"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("Incidents créés aujourd'hui"), {
      target: { value: "1" },
    });

    await expectCalledAfterDebounce(mockedCreate);

    expect(mockedCreate).toHaveBeenCalledWith("scope-1", {
      day: "2026-09-19",
      errors_reported: 3,
      incidents_created: 1,
      feai: [],
    });
    expect(onChanged).toHaveBeenCalled();
    expect(mockedUpdate).not.toHaveBeenCalled();
  });

  it("met à jour une activité existante (PATCH)", async () => {
    renderEditor({
      scopeId: "scope-1",
      day: "2026-09-19",
      initialActivity: EXISTING_ACTIVITY,
    });

    fireEvent.change(screen.getByLabelText("Erreurs signalées du jour"), {
      target: { value: "5" },
    });

    await expectCalledAfterDebounce(mockedUpdate);

    expect(mockedUpdate).toHaveBeenCalledWith("scope-1", "2026-09-19", {
      errors_reported: 5,
      incidents_created: 2,
      feai: ["INC000000001"],
    });
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("bloque la sauvegarde quand incidents > erreurs", async () => {
    renderEditor({
      scopeId: "scope-1",
      day: "2026-09-19",
      initialActivity: EXISTING_ACTIVITY,
    });

    fireEvent.change(screen.getByLabelText("Incidents créés aujourd'hui"), {
      target: { value: "9" },
    });

    await new Promise((r) => setTimeout(r, 1000));

    expect(mockedUpdate).not.toHaveBeenCalled();
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("basculer create en PATCH si le POST répond 409 (conflit)", async () => {
    mockedCreate.mockRejectedValueOnce(new ApiError(409, "Conflit"));

    renderEditor({
      scopeId: "scope-1",
      day: "2026-09-19",
      initialActivity: null,
    });

    fireEvent.change(screen.getByLabelText("Erreurs signalées du jour"), {
      target: { value: "2" },
    });

    await expectCalledAfterDebounce(mockedUpdate);
  });
});
