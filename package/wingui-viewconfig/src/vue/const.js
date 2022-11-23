/* File storage category */
const gFileStorageCategory = {
  SYSTEM: 'system',
  OTHERS: 'others',
  SHARE: 'share',
  TEMPORARY: 'temporary',
  NOTICEBOARD: 'noticeboard'
};

/* http response status */
const gHttpStatus = {
  SUCCESS: 200,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

/* operation type */
const gOperationType = {
  CREATE: 'CREATE',
  DELETE: 'DELETE',
  EXPORT: 'EXPORT',
  IMPORT: 'IMPORT',
  READ: 'READ',
  UPDATE: 'UPDATE',
  getAllType: function () {
    return (
      this.CREATE +
      ', ' +
      this.DELETE +
      ', ' +
      this.EXPORT +
      ', ' +
      this.IMPORT +
      ', ' +
      this.READ +
      ', ' +
      this.UPDATE
    );
  }
};

export { gFileStorageCategory, gHttpStatus, gOperationType };
