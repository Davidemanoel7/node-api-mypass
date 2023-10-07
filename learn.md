# instal

CORS: Cross-Origin Resources Sharing

User: {
	id: int
	photo: String
	name: String
    user: String
	email: String
	password: String	
}
Password: {
    id: int
	description: String
	password: String
	userId: int (fk)
}

[Account] (1,1)-------------(1,*) [Password]

# Account <Allow>
	GET: "/user/id/" (id, photo, name, email)
	POST: "/user/"
	PUT: "/user/id/"
	DELETE: "/user/id"
	
# Password <Auth>
	GET: "/pass/id/" (all)
	POST: "/pass/"
	PUT: "/pass/id"
	DELETE: "/pass/id"