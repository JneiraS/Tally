def main() -> None:
    """Run the ProTab HTTP API server."""
    import uvicorn

    from protab.adapters.inbound.api.app import create_default_app
    from protab.adapters.inbound.api.config import host_port_from_env

    host, port = host_port_from_env()
    uvicorn.run(create_default_app(), host=host, port=port)
