package utils

import "gopkg.in/gomail.v2"

type EmailBody struct {
	From        string
	To			[]string
	Subject		string
	Body 		string
	Annex		string
}

func CreateDialer(host, user, pass string, port int) *gomail.Dialer  {
	return gomail.NewDialer(host, port, user, pass)
}

func CreateMsg(b *EmailBody) *gomail.Message {
	m := gomail.NewMessage()
	m.SetHeader("From","Monitor" + "<" + b.From + ">")
	m.SetHeader("To", b.To...)  //发送给多个用户
	m.SetHeader("Subject", b.Subject)  //设置邮件主题
	m.SetBody("text/plain", b.Body)  //设置邮件正文
	return m
}

func CreateMsgWithAnnex(b *EmailBody) *gomail.Message{
	m := gomail.NewMessage()
	m.SetHeader("From","Monitor" + "<" + b.From + ">")
	m.SetHeader("To", b.To...)  //发送给多个用户
	m.SetHeader("Subject", b.Subject)  //设置邮件主题
	m.SetBody("text/html", b.Body)     //设置邮件正文
	m.Attach(b.Annex)							// 设置附件
	return m
}

func SendMsg(gd *gomail.Dialer,msg *gomail.Message) error {
	return gd.DialAndSend(msg)
}
