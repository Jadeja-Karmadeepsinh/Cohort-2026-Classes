# Set directory where the certificates will be stored
CERT_DIR="cert"

# Create the cert directory if not exist
mkdir -p "$CERT_DIR"

# Generate private key (RSA 2048-bit)
openssl genpkey -algorithm RSA -out "$CERT_DIR/private-key.pem" -pkeyopt rsa_keygen_bits:2048

# Generate public key from the private key
openssl rsa -in "$CERT_DIR/private-key.pem" -pubout -out "$CERT_DIR/public-key.pub"

# Print success message
echo "Keys have been generated in the $CERT_DIR/ folder."