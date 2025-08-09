import jwt from "jsonwebtoken";

// Obtiene el secreto en tiempo de ejecución (no al importar)
const getSecret = () => {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET no está definido en variables de entorno");
  return s;
};

export const verifyToken = (req, res, next) => {
  const authHeader = req.get("authorization"); // headers case-insensitive
  if (!authHeader) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  // Acepta “Bearer   <token>” con espacios extra y case-insensitive
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({ message: "Formato de autorización inválido" });
  }
  const token = match[1].trim();

  try {
    const decoded = jwt.verify(token, getSecret(), { algorithms: ["HS256"] });
    // Aseguramos shape conocido
    req.user = { id: String(decoded.id), role: decoded.role };
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expirado" });
    }
    return res.status(401).json({ message: "Token inválido" });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Solo los administradores pueden realizar esta acción" });
  }
  return next();
};

export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "No autorizado" });
  }
  return next();
};

// Extra útil: admin o el propio usuario (para /users/:id)
export const requireSelfOrAdmin = (param = "id") => (req, res, next) => {
  const targetId = req.params[param];
  if (!req.user) return res.status(401).json({ message: "No autenticado" });
  if (req.user.role === "admin" || String(req.user.id) === String(targetId)) {
    return next();
  }
  return res.status(403).json({ message: "No autorizado" });
};
