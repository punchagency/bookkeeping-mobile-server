class HttpConstants {
  public readonly OK = "Operation successful";
  public readonly CREATED = "Resource created successfully";
  public readonly UPDATED = "Resource updated successfully";
  public readonly DELETED = "Resource deleted successfully";
  public readonly NOT_FOUND = "Resource not found";
  public readonly UNAUTHORIZED = "Unauthorized";
  public readonly FORBIDDEN =
    "Forbidden. You do not have access to this resource";
  public readonly BAD_REQUEST = "One or more validation errors occurred";
  public readonly INTERNAL_SERVER_ERROR = "Internal server error";
  public readonly CONFLICT = "Conflict";
}

export default HttpConstants;
