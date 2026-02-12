"""Tests for the embedding service."""

from unittest.mock import patch, MagicMock


class TestEmbeddingService:
    """Embedding generation via google-genai SDK."""

    def test_generate_embedding_returns_768_dim_list(self):
        """Mock the genai client and verify output shape."""
        mock_response = MagicMock()
        mock_response.embeddings = [MagicMock(values=[0.1] * 768)]

        with patch("services.embeddings._get_genai_client") as mock_client:
            mock_client.return_value.models.embed_content.return_value = (
                mock_response
            )
            from services.embeddings import generate_embedding

            result = generate_embedding("test query")
            assert isinstance(result, list)
            assert len(result) == 768

    def test_generate_embedding_calls_correct_model(self):
        """Verify we call text-embedding-004."""
        mock_response = MagicMock()
        mock_response.embeddings = [MagicMock(values=[0.1] * 768)]

        with patch("services.embeddings._get_genai_client") as mock_client:
            mock_client.return_value.models.embed_content.return_value = (
                mock_response
            )
            from services.embeddings import generate_embedding

            generate_embedding("test")
            call_args = (
                mock_client.return_value.models.embed_content.call_args
            )
            assert "text-embedding-004" in str(call_args)

    def test_generate_embedding_handles_error(self):
        """Should return None on API failure."""
        with patch("services.embeddings._get_genai_client") as mock_client:
            mock_client.return_value.models.embed_content.side_effect = (
                Exception("API error")
            )
            from services.embeddings import generate_embedding

            result = generate_embedding("test query")
            assert result is None
