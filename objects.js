class CCObject {
	constructor() {
		this.name = null;
		this.id = null;
	}
}

class CCFile extends CCObject {
	constructor() {		
		super();
		this.parentFolder = null;
		this.size = 0;
		this.base64Data = null;
	}
}

class CCFolder extends CCObject {
	constructor() {
		super();
		this.parentFolder = null;
		this.files = {};		
	}
	getFileCount() {
		return Objects.keys(this.files).length;
	}
}

class CCFAT extends CCObject {
	constructor() {
		super();
		this.root = new CCFolder();
		this.root.name = "%root%";
	}
}