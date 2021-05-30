class CCStringUtil {
	constructor() {}
	
	static isEmpty(string) { //returns boolean
		return string == null || string === "";
	}	
}

class CCFileUtil {
	static basename(path) {
		if (CCStringUtil.isEmpty(path)) {
			return null;
		}
		var slashIndex = path.lastIndexOf("/");
		if (slashIndex == -1) {
			return path;
		} else if (slashIndex + 1 < path.length) {
			return path.substr(slashIndex + 1);
		}
		return null;
	}

	static dirname(path) {
		if (CCStringUtil.isEmpty(path)) {
			return null;
		}
		var slashIndex = path.lastIndexOf("/");
		return slashIndex == -1 ? null : path.substr(0, slashIndex);
	}
}

class CCFileSystem {
	constructor() {
		this.fat = new CCFAT();
	}

	mkdir(path) { //returns folder object created
		this.checkPath(path);
		var currentFolder = this.fat.root;
		var pathParts = path.split("/");
		for (const i in pathParts) {
			var part = pathParts[i];
			if (CCStringUtil.isEmpty(part) || part === ".") {
				continue;
			}
			//FIXME: handle ".." in path
			var tmpFolder = currentFolder.files[part];
			if (tmpFolder == null) {
				tmpFolder = new CCFolder();
				tmpFolder.name = part;
				tmpFolder.parentFolder = currentFolder;
				currentFolder.files[part] = tmpFolder;
			}
			currentFolder = tmpFolder;
		}
		return currentFolder;
	}

	findFileOrFolder(path) { //returns CCFile or CCFolder
		this.checkPath(path);
		var currentFolderOrFile = this.fat.root;
		var pathParts = path.split("/");
		if (path.indexOf("/") == -1) {
			pathParts = [path];
		}
		for (const i in pathParts) {
			var part = pathParts[i];
			if (CCStringUtil.isEmpty(part) || part === ".") {
				continue;
			}
			//FIXME: handle ".." in path
			var tmpObject = currentFolderOrFile.files[part];
			if (tmpObject == null) {
				return null;
			}
			currentFolderOrFile = tmpObject;
		}
		return currentFolderOrFile;
	}

	getFile(path) { //returns CCFile
		var fileOrFolder = this.findFileOrFolder(path);
		if (fileOrFolder === null || !(fileOrFolder instanceof CCFile)) {
			return null;
		}
		return fileOrFolder;
	}

	storeFAT() {

	}	

	touchFile(path) { // returns touched CCFile
		this.checkPath(path);
		var folderPath = CCFileUtil.dirname(path);
		var fileName = CCFileUtil.basename(path);
		var parentFolder = this.fat.root;
		if (folderPath != null) { //path has folders in it
			parentFolder = this.getFolder(folderPath);
			if (parentFolder == null) {
				throw "Folder for file does not exist. file: " + path;
			}
		}
		var file = parentFolder.files[fileName];
		if (file == null) {
			file = new CCFile();
			file.name = fileName;
			file.parentFolder = parentFolder;
			parentFolder.files[fileName] = file;
			this.storeFAT();
		}
		return file;
	}

	writeFile(path, fileContents) {
		var file = this.touchFile(path);
		if (file != null) {
			file.base64Data = fileContents;
			//FIXME: write file
			this.storeFAT();
		}
	}

	readFile(path) {
		var file = this.getFile(path);
		if (file == null) {
			throw "File does not exist: " + path;
		}
		return file.base64Data;
	}

	getFolder(path) { //returns CCFolder
		var fileOrFolder = this.findFileOrFolder(path);
		if (fileOrFolder == null || !(fileOrFolder instanceof CCFolder)) {
			return null;
		}
		return fileOrFolder;
	}

	checkPath(path) {
		if (CCStringUtil.isEmpty(path)) {
			throw "Path cannot be empty";
		} else {
			console.log("Path isn't empty: '" + path + "'");
		}
	}
}

class CCFileSystemUtil {
	static fileExists(fileSystem, path) { //returns boolean
		return fileSystem.getFile(path) != null;
	}

	static folderExists(fileSystem, path) {
		return fileSystem.getFolder(path) != null;
	}

	static listFiles(fileSystem, path) { //returns array file names
		var folderPath = CCFileUtil.dirname(path);
		var folder = fileSystem.getFolder(folderPath);
		if (folder == null) {
			throw "Folder does not exist: " + path;
		}
		var names = [];
		for (const i in folder.files) {
			names.push(folder.files[i].name);
		}
		return names;
	}

	static getFilePath(ccFile) {
		var path = ccFile.name;
		var parentFolder = ccFile.parentFolder;
		while (parentFolder != null) {
			path = parentFolder.name + "/" + path;
			parentFolder = parentFolder.parentFolder;
		}
		return path;
	}

	static listAllFiles(fileSystem) { //returns an array of strings of absolute paths to files, one per file
		var files = [];
		var foundFiles = this.findAllFiles(fileSystem);
		for (const i in foundFiles) {
			files.push(this.getFilePath(foundFiles[i]));
		}
		return files;
	}

	static findAllFiles(fileSystem) { // returns array of CCFile
		var files = [];
		this.innerFindAllFiles(fileSystem.fat.root, files);
		return files;
	}	

	static innerFindAllFiles(currentFolder, files) {
		if (currentFolder == null || !(currentFolder instanceof CCFolder)) {
			return;
		}
		for (const i in currentFolder.files) {
			var tmpFile = currentFolder.files[i];
			if (tmpFile instanceof CCFile) {
				files.push(tmpFile);				
			} else if (tmpFile instanceof CCFolder) {
				this.innerFindAllFiles(tmpFile, files);
			}
		}
	}
}