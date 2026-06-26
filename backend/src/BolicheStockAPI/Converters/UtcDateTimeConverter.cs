using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace BolicheStockAPI.Converters;

public class UtcDateTimeConverter : JsonConverter<DateTime>
{
    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        => DateTime.Parse(reader.GetString() ?? "", null, DateTimeStyles.AdjustToUniversal | DateTimeStyles.AssumeUniversal);

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        if (value.Kind == DateTimeKind.Unspecified)
            value = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        writer.WriteStringValue(value.ToUniversalTime().ToString("yyyy'-'MM'-'dd'T'HH':'mm':'ss'.'fff'Z'"));
    }
}
