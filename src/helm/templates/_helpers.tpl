{{/*
Generate a fullname for the chart
*/}}
{{- define "swiggy-frontend.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
