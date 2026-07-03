read -sp "Enter passphrase: " pass
echo
read -sp "Confirm: " passConf

[[ $pass != $passConf ]] && echo -e "\nIncorrect pair" && exit 1

iter_limit=${2:-5}
length=${3:-15}
pattern="[@#$%^*_+-:,.?/]"
[[ -n $4 ]] && pattern=$4 || true
antipattern=$5

while getopts "i:l:" flag; do
 case $flag in
   i)
   iter_limit=$OPTARG
   ;;
   l)
   length=$OPTARG
   ;;
 esac
done

echo "asd: $iter_limit $length"

echo -e "\nAvailable passwords: "

iter=100000;
for (( i=0 ; i<=$iter_limit-1 ; i )); 
do
  STR=$(echo $1 | openssl aes-256-cbc -md sha512 -pbkdf2 -iter $iter -base64 -A -nosalt -pass pass:$pass | cut -c -$length)
  display="false"
  [[ $STR =~ [0-9] ]] && [[ $STR =~ $pattern ]] && [[ $STR =~ ${4:-''} ]] && i=$((i+1)) && display="true";
  [[ -n $antipattern ]] && [[ $STR =~ $antipattern ]] && display="false"
  [[ $display == "true" ]] && echo $STR;
  iter=$(expr $iter + 1)
done
