package utils

import (
	"fmt"
	"strings"
)

func StringInSlice(a string, slice []string) bool {
	for _, b := range slice {
		if b == a {
			return true
		}
	}
	return false
}

// 空struct不占内存空间，可谓巧妙
func RemoveDuplicateElement(slice []string) []string {
	result := make([]string, 0, len(slice))
	temp := map[string]struct{}{}
	for _, item := range slice {
		if _, ok := temp[item]; !ok {
			temp[item] = struct{}{}
			result = append(result, item)
		}
	}
	return result
}

func StrArrContains(slice []string, item string) bool {
	set := make(map[string]struct{}, len(slice))
	for _, s := range slice {
		set[s] = struct{}{}
	}

	_, ok := set[item]
	return ok
}


func IntArrToString(arr []int, delim string) string {
	return strings.Trim(strings.Replace(fmt.Sprint(arr), " ", delim, -1), "[]")
	//return strings.Trim(strings.Join(strings.Split(fmt.Sprint(arr), " "), delim), "[]")
	//return strings.Trim(strings.Join(strings.Fields(fmt.Sprint(arr)), delim), "[]")
}

func UnionTwoInt64Slice(s1, s2 []int64) []int64 {
	m := make(map[int64]bool)

	for _, item := range s1 {
		m[item] = true
	}

	for _, item := range s2 {
		if _, ok := m[item]; !ok {
			s1 = append(s1, item)
		}
	}

	return s1
}

func UnionTwoSlice(s1, s2 []string) []string {
	m := make(map[string]bool)

	for _, item := range s1 {
		m[item] = true
	}

	for _, item := range s2 {
		if _, ok := m[item]; !ok {
			s1 = append(s1, item)
		}
	}

	return s1
}

func IntersectionTwoSlice(s1, s2 []string) (inter []string) {
	hash := make(map[string]bool)
	for _, e := range s1 {
		hash[e] = true
	}
	for _, e := range s2 {
		// If elements present in the hashmap then append intersection list.
		if hash[e] {
			inter = append(inter, e)
		}
	}
	//Remove dups from slice.
	inter = removeDups(inter)
	return
}

//Remove dups from slice.
func removeDups(elements []string)(nodups []string) {
	encountered := make(map[string]bool)
	for _, element := range elements {
		if !encountered[element] {
			nodups = append(nodups, element)
			encountered[element] = true
		}
	}
	return
}