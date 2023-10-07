# Arquitetura

table User(
	id: int
	photo: String
	name: String
    user: String
	email: String
	password: String	
)
table Password(
    id: int
	description: String
	password: String
	userId: int (fk)
)

## Schema
[Account] (1,1)-------------(1,*) [Password]

## Account <Allow>
	GET: "/users/id/" (photo(?), name, email)
	POST: "/users/"
	PUT: "/users/id/"
	DELETE: "/users/id"
	
## Password <Auth>
	GET: "/pass/id/" (all)
	POST: "/pass/"
	PUT: "/pass/id"
	DELETE: "/pass/id"