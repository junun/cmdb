package main

import (
	"fmt"
	ldap "github.com/go-ldap/ldap/v3"
	"log"
	"runtime"
	"time"
)

func main()  {
	fmt.Println(runtime.Version())
	l, err := ldap.Dial("tcp", "10.9.12.51:389")
	fmt.Println(err)
	//设置超时时间
	l.SetTimeout(5 * time.Second)
	defer l.Close()

	// First bind with a read only user
	err = l.Bind("youyu-ldap", "2H3bkaquqH")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("xxoo")

	// Search for the given username
	searchRequest := ldap.NewSearchRequest(
		"OU=MHS,DC=mhs,DC=local",
		ldap.ScopeWholeSubtree, ldap.NeverDerefAliases, 0, 0, false,
		fmt.Sprintf("(&(sAMAccountName=%s))",  "len.liu"),
		[]string{"sAMAccountName", "displayName", "mail", "phone"},
		//[]string{"dn"},
		nil,
	)

	sr, err := l.Search(searchRequest)
	if err != nil {
		log.Fatal(err)
	}

	if len(sr.Entries) != 1 {
		log.Fatal("User does not exist or too many entries returned")
	}

	fmt.Println(sr.Entries[0].Attributes)
	userdn := sr.Entries[0].DN
	attributes := make(map[string][]string)
	for _, attr := range sr.Entries[0].Attributes {
		attributes[attr.Name] = attr.Values
	}
	fmt.Println(attributes)

	// Bind as the user to verify their password
	err = l.Bind(userdn, "Angus7170.0")
	if err != nil {
		log.Fatal(err)
	}

}

