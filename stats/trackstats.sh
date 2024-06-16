#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 output_file.csv"
  exit 1
fi

OUTPUT_FILE=$1

echo "Name;CPU;Memory_MB;Network_RX_MB;Network_TX_MB" > $OUTPUT_FILE

convert_to_mb() {
  local value=$1
  if [[ $value == *KiB ]]; then
    echo "scale=2; ${value%KiB} / 1024" | awk '{printf "%.2f", $1}'
  elif [[ $value == *MiB ]]; then
    echo "${value%MiB}"
  elif [[ $value == *GiB ]]; then
    echo "${value%GiB} * 1024" | awk '{printf "%.2f", $1}'
  else
    echo "0"
  fi
}

convert_to_megabytes() {
  local value=$1
  if [[ $value == *KB ]]; then
    echo "scale=3; ${value%KB} / 1000" | awk '{printf "%.3f", $1}'
  elif [[ $value == *MB ]]; then
    echo "${value%MB}"
  elif [[ $value == *GB ]]; then
    echo "${value%GB} * 1000" | awk '{printf "%.0f", $1}'
  elif [[ $value == *KiB ]]; then
    echo "scale=3; ${value%KiB} / 1024" | awk '{printf "%.3f", $1}'
  elif [[ $value == *MiB ]]; then
    echo "${value%MiB}"
  elif [[ $value == *GiB ]]; then
    echo "${value%GiB} * 1024" | awk '{printf "%.0f", $1}'
  else
    echo "0"
  fi
}

while true; do
  docker stats --no-stream --format "{{.Name}},{{.CPUPerc}},{{.MemUsage}},{{.NetIO}}" | \
  while IFS=, read -r name cpu mem netio; do
    cpu=$(echo $cpu | tr -d '%')
    mem=$(convert_to_mb "$mem")
    rx=$(echo $netio | awk '{print $1}')
    tx=$(echo $netio | awk '{print $3}')
    rx_mb=$(convert_to_megabytes "$rx")
    tx_mb=$(convert_to_megabytes "$tx")
    echo "$name;$cpu;$mem;$rx_mb;$tx_mb" >> $OUTPUT_FILE
  done
  sleep 0.05
done
