"""``protab-project --help`` must list the subcommands.

The dispatcher resolves the subcommand before argparse ever runs, so the
top-level help used to be the *create* parser: someone asking for help was
shown ``code`` and ``name`` and nothing else, which is how ``add-admin``
stayed invisible. No database is involved in any of this, hence a unit test.
"""

import pytest

from protab import project_admin


def run_cli(monkeypatch, *argv: str) -> None:
    monkeypatch.setattr("sys.argv", ["protab-project", *argv])


@pytest.mark.parametrize("flag", ["-h", "--help", "help"])
def test_help_lists_every_subcommand(monkeypatch, capsys, flag):
    run_cli(monkeypatch, flag)

    project_admin.main()

    out = capsys.readouterr().out
    for subcommand in (
        project_admin.SET_PASSWORD,
        project_admin.ADD_ADMIN,
        project_admin.REMOVE_ADMIN,
        project_admin.LIST_ADMINS,
    ):
        assert subcommand in out


def test_help_mentions_the_positional_form(monkeypatch, capsys):
    """``protab-project <code> <nom>`` predates the subcommands and stays valid."""
    run_cli(monkeypatch, "--help")

    project_admin.main()

    out = capsys.readouterr().out
    assert "<code>" in out
    assert "<nom>" in out


def test_help_points_at_the_reference_page(monkeypatch, capsys):
    run_cli(monkeypatch, "--help")

    project_admin.main()

    assert "docs/cli.md" in capsys.readouterr().out


def test_help_exits_successfully(monkeypatch, capsys):
    run_cli(monkeypatch, "--help")

    project_admin.main()

    assert capsys.readouterr().err == ""


def test_no_argument_reports_the_usage_and_keeps_the_error_exit_code(
    monkeypatch, capsys
):
    """A bare invocation is still an error.

    Turning it into a success would make a script see exit 0 where argparse
    used to fail it, so the exit code is preserved and only the message
    improves.
    """
    run_cli(monkeypatch)

    with pytest.raises(SystemExit) as excinfo:
        project_admin.main()

    assert excinfo.value.code == 2
    captured = capsys.readouterr()
    assert project_admin.ADD_ADMIN in captured.err
    assert captured.out == ""


def test_subcommand_help_is_unchanged(monkeypatch, capsys):
    """The inventory must not swallow the per-subcommand argparse help."""
    run_cli(monkeypatch, "add-admin", "--help")

    with pytest.raises(SystemExit) as excinfo:
        project_admin.main()

    assert excinfo.value.code == 0
    out = capsys.readouterr().out
    assert "protab-project add-admin" in out
    assert "quadrigramme" in out


def test_a_subcommand_without_its_arguments_still_errors(monkeypatch):
    run_cli(monkeypatch, "set-password")

    with pytest.raises(SystemExit) as excinfo:
        project_admin.main()

    assert excinfo.value.code == 2
