export class H5PLibraryManager {
  private libraries: Map<string, any> = new Map();

  constructor() {
    this.libraries = new Map();
  }

  addLibrary(id: string, library: any) {
    this.libraries.set(id, library);
  }

  getLibrary(id: string) {
    return this.libraries.get(id);
  }

  getAllLibraries() {
    return Array.from(this.libraries.values());
  }

  removeLibrary(id: string) {
    this.libraries.delete(id);
  }

  clear() {
    this.libraries.clear();
  }
}

export default H5PLibraryManager;