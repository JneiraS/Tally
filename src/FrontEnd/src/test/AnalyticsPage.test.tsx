/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AnalyticsPage } from "../pages/AnalyticsPage";
import { protabApi } from "../services/api";
import { getTodayIsoDate } from "../utils/date";

vi.mock("../services/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/api")>();
  return {
    ...actual,
    protabApi: {
      ...actual.protabApi,
      getScopeMonitorings: vi.fn(),
    },
  };
});

vi.mock("../utils/date", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../utils/date")>();
  return {
    ...actual,
    getTodayIsoDate: vi.fn(() => "2026-09-21"),
  };
});

const SCOPES = [
  {
    id: "s1",
    name: "Alpha",
    knowledge_base_id: "KB-ANALYSE-1",
    official_main: "Alice",
    official_backup: "Bob",
    billing_code: "FACT-2026-PAI",
    daily_activities: [
      {
        day: "2026-09-21",
        errors_reported: 4,
        incidents_created: 1,
        feai: [],
        handled: true,
        completed: true,
      },
    ],
  },
  {
    id: "s2",
    name: "Beta",
    knowledge_base_id: "KB-ANALYSE-2",
    official_main: "Alice",
    official_backup: "Bob",
    billing_code: "FACT-2026-INF",
    daily_activities: [
      {
        day: "2026-09-21",
        errors_reported: 8,
        incidents_created: 0,
        feai: [],
        handled: true,
        completed: false,
      },
    ],
  },
];

const NON_WORKING_DAYS = { excluded_weekdays: [6, 7], excluded_dates: [] };

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/analyse"]}>
      <AnalyticsPage nonWorkingDays={NON_WORKING_DAYS} />
    </MemoryRouter>,
  );
}

describe("AnalyticsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getTodayIsoDate).mockReturnValue("2026-09-21");
    vi.mocked(protabApi.getScopeMonitorings).mockResolvedValue(SCOPES);
  });

  it("porte un titre de page comme les autres pages de l'application", async () => {
    renderPage();

    // Un seul `h1` par page : il donne le nom du document au lecteur d'écran et
    // sert de cible au focus clavier.
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: /Analyse/i }),
      ).toBeInTheDocument();
    });
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("résume la période sélectionnée et nomme ses trois sections", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Arriéré par périmètre/i })).toBeInTheDocument();
    });
    expect(
      screen.getByRole("heading", { name: /Classement des périmètres/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Grille de supervision/i }),
    ).toBeInTheDocument();
  });

  it("additionne erreurs, incidents et arriéré des périmètres retenus", async () => {
    renderPage();

    // Alpha 4/1 et Beta 8/0 => 12 erreurs, 1 incident, 11 en attente
    await waitFor(() => {
      expect(screen.getByText("12")).toBeInTheDocument();
    });
    expect(screen.getByText("11")).toBeInTheDocument();
  });

  it("pré-sélectionne tous les périmètres et annonce le compte", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("2 périmètres sur 2")).toBeInTheDocument();
    });
  });

  it("affiche le contexte courant de la vue", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/01–21\/09\/2026/)).toBeInTheDocument();
    });
    expect(screen.getByText(/Vue quotidienne · jours ouvrés/)).toBeInTheDocument();
  });

  it("décoche un périmètre et renégocie le compte affiché", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("2 périmètres sur 2")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("checkbox", { name: /Alpha/ }));

    await waitFor(() => {
      expect(screen.getByText("1 périmètre sur 2")).toBeInTheDocument();
    });

    // Beta seul : 8 erreurs et 8 en attente. Les cartes sont ciblées par leur
    // intitulé : « 8 » seul apparaît aussi dans la grille et le classement.
    const cards = within(screen.getByRole("region", { name: "Résumé de la période" }));
    expect(cards.getByText("Erreurs").closest("div")).toHaveTextContent("8");
    expect(cards.getByText("En attente").closest("div")).toHaveTextContent("8");
    expect(cards.getByText("Erreurs").closest("div")).not.toHaveTextContent("12");
  });

  it("présente un état vide explicite quand plus aucun périmètre n'est retenu", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("2 périmètres sur 2")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Tout décocher/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Sélectionnez au moins un périmètre/i),
      ).toBeInTheDocument();
    });
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("change la période quand on choisit un preset", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/Période : début/i)).toHaveValue("2026-09-01");
    });

    fireEvent.click(screen.getByRole("button", { name: /7 jours ouvrés/i }));

    // 16 septembre est un jour ouvré ici (la config du test n'exclut pas de
    // date), donc les 7 jours ouvrés finissent le 21 remontent jusqu'au 11.
    await waitFor(() => {
      expect(screen.getByLabelText(/Période : début/i)).toHaveValue("2026-09-11");
    });
    expect(screen.getByLabelText(/Période : fin/i)).toHaveValue("2026-09-21");
  });

  it("bascule l agrégat en semaine et renomme les colonnes", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Par semaine/i }));

    await waitFor(() => {
      expect(screen.getByRole("columnheader", { name: /S39/ })).toBeInTheDocument();
    });
  });

  it("annonce une période sans aucune saisie plutôt qu'un graphique vide", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    const from = screen.getByLabelText(/Période : début/i);
    fireEvent.change(from, { target: { value: "2026-09-14" } });
    fireEvent.change(screen.getByLabelText(/Période : fin/i), { target: { value: "2026-09-18" } });

    await waitFor(() => {
      expect(
        screen.getByText(/Aucune saisie sur la période/i),
      ).toBeInTheDocument();
    });
  });

  it("retire les jours non ouvrés de l agrégat quand on le demande", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    const columnCount = () =>
      within(screen.getByRole("table")).getAllByRole("columnheader").length - 2;

    // Du 14 au 21 : 6 jours ouvrés (19 et 20 sont le week-end).
    fireEvent.change(screen.getByLabelText(/Période : début/i), { target: { value: "2026-09-14" } });

    await waitFor(() => {
      expect(columnCount()).toBe(6);
    });

    fireEvent.click(screen.getByRole("checkbox", { name: /Jours ouvrés uniquement/i }));

    await waitFor(() => {
      expect(columnCount()).toBe(8);
    });
  });

  it("remonte la période précédente de même longueur pour la comparaison", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/2 périmètres sur 2/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("checkbox", { name: /Comparer à la période précédente/i }));

    await waitFor(() => {
      expect(
        screen.getAllByText(/vs période précédente/i).length,
      ).toBeGreaterThan(0);
    });
  });

  it("propose l export CSV de la sélection courante", async () => {
    renderPage();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Exporter la sélection/i }),
      ).toBeInTheDocument();
    });
  });
});
