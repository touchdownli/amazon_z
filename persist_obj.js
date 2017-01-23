var PersistentObjValue = {"value":null, "end_timestamp":1};
function SetPersistObjAttr(attr, value) {
    this.PersistentObjValue[attr] = value;
}
function SetKey(value) {
    this.key = value;
}
function IsKeyExist(key) {
    return GM_getValue(key, false);
}
function Persist() {
	var value_str = JSON.stringify(this.PersistentObjValue);
    GM_setValue(this.key, value_str);
}
function GetPersistObjAttr(attr) {
    var value_str = GM_getValue(this.key, null);
    if (value_str === null) {
        return null;
    }
    var value_obj = null;
    try {
        value_obj = JSON.parse(value_str);
    } catch(e) {
        console.log("JSON parse except:%s", value_str);
        return undefined;
    }
    return value_obj[attr];
}
function ExpirePersistObj() {
    var now = (new Date()).getTime() / 1000;
    var del_cnt = 0, cnt = 0;
    for (let key of GM_listValues()) {
        this.key = key;
        var end_timestamp = this.GetPersistObjAttr("end_timestamp");
        cnt += 1;
        if (end_timestamp === undefined || end_timestamp < now) {
			GM_deleteValue(key);
            del_cnt += 1;
            console.log("delete item:%s, end_time:%s, now:%s", key, end_timestamp, now);
        }
    }
    console.log("Total history items:%d, del:%d", cnt, del_cnt);
}
var Persistentor = {PersistentObjValue, "key":null, SetPersistObjAttr, SetKey, IsKeyExist, Persist, GetPersistObjAttr, ExpirePersistObj};
