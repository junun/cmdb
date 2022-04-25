package utils

import (
	"crypto/tls"
	"fmt"
	ldap "github.com/go-ldap/ldap/v3"
	"github.com/pkg/errors"
)

type LDAP_CONFIG struct {
	Addr       string   `json:"addr"`
	BaseDn     string   `json:"baseDn"`
	BindDn     string   `json:"bindDn"`
	BindPass   string   `json:"bindPass"`
	AuthFilter string   `json:"authFilter"`
	Attributes []string `json:"attributes"`
	TLS        bool     `json:"tls"`
	StartTLS   bool     `json:"startTLS"`
	Conn       *ldap.Conn
}

func (lc *LDAP_CONFIG) Close() {
	if lc.Conn != nil {
		lc.Conn.Close()
		lc.Conn = nil
	}
}

func (lc *LDAP_CONFIG) Connect() (err error) {
	if lc.TLS {
		lc.Conn, err = ldap.DialTLS("tcp", lc.Addr, &tls.Config{InsecureSkipVerify: true})
	} else {
		lc.Conn, err = ldap.Dial("tcp", lc.Addr)
	}
	if err != nil {
		return err
	}

	if !lc.TLS && lc.StartTLS {
		err = lc.Conn.StartTLS(&tls.Config{InsecureSkipVerify: true})
		if err != nil {
			lc.Conn.Close()
			return err
		}
	}

	err = lc.Conn.Bind(lc.BindDn, lc.BindPass)
	if err != nil {
		lc.Conn.Close()
		return err
	}
	return err
}

func (lc *LDAP_CONFIG) Auth(username, password string) (success bool, attributes map[string][]string, err error) {
	searchRequest := ldap.NewSearchRequest(
		lc.BaseDn, // The base dn to search
		ldap.ScopeWholeSubtree, ldap.NeverDerefAliases, 0, 0, false,
		fmt.Sprintf(lc.AuthFilter, username), // The filter to apply
		lc.Attributes,                        // A list attributes to retrieve
		nil,
	)
	sr, err := lc.Conn.Search(searchRequest)
	if err != nil {
		return
	}
	if len(sr.Entries) == 0 {
		err = errors.New("Cannot find such user")
		return
	}
	if len(sr.Entries) > 1 {
		err = errors.New("Multi users in search")
		return
	}

	// 拿这个 dn 和他的密码去做 bind 验证
	err = lc.Conn.Bind(sr.Entries[0].DN, password)
	if err != nil {
		return
	}

	// 如果后续还需要做其他操作,那么使用最初的 bind 账号重新 bind 回来.恢复初始权限.
	err = lc.Conn.Bind(lc.BindDn, lc.BindPass)
	if err != nil {
		return
	}
	attributes = make(map[string][]string)
	for _, attr := range sr.Entries[0].Attributes {
		attributes[attr.Name] = attr.Values
	}
	success = true
	return
}