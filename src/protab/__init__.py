def main() -> None:
    """Run the ProTab HTTP API server."""
    import uvicorn

    uvicorn.run("protab.adapters.inbound.api.app:app", host="0.0.0.0", port=8000)