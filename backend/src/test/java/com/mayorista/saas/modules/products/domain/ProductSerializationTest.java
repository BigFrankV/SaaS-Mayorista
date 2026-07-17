package com.mayorista.saas.modules.products.domain;

import org.junit.jupiter.api.Test;

import java.io.*;
import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit test for ProductEntity Java serialization round-trip.
 * <p>
 * Verifies that ProductEntity implements Serializable correctly and all fields
 * survive serialization/deserialization. This is critical because the Redis
 * cache layer uses JdkSerializationRedisSerializer which relies on Java
 * serialization.
 */
class ProductSerializationTest {

    @Test
    void serializationRoundTrip_allFieldsPreserved() throws Exception {
        UUID id = UUID.randomUUID();
        UUID tenantId = UUID.randomUUID();
        Instant now = Instant.now();

        ProductEntity original = new ProductEntity();
        original.setId(id);
        original.setTenantId(tenantId);
        original.setCodigoBarras("7891234567890");
        original.setNombre("Test Product");
        original.setStockActual(100);
        original.setStockMinimo(10);
        original.setPrecioNeto(25000);
        original.setCreadoEn(now);
        original.setActualizadoEn(now);

        // Serialize to byte array
        byte[] bytes;
        try (ByteArrayOutputStream bos = new ByteArrayOutputStream();
             ObjectOutputStream oos = new ObjectOutputStream(bos)) {
            oos.writeObject(original);
            bytes = bos.toByteArray();
        }

        // Deserialize from byte array
        ProductEntity deserialized;
        try (ByteArrayInputStream bis = new ByteArrayInputStream(bytes);
             ObjectInputStream ois = new ObjectInputStream(bis)) {
            deserialized = (ProductEntity) ois.readObject();
        }

        // Assert all fields match
        assertEquals(id, deserialized.getId(), "id");
        assertEquals(tenantId, deserialized.getTenantId(), "tenantId");
        assertEquals("7891234567890", deserialized.getCodigoBarras(), "codigoBarras");
        assertEquals("Test Product", deserialized.getNombre(), "nombre");
        assertEquals(100, deserialized.getStockActual(), "stockActual");
        assertEquals(10, deserialized.getStockMinimo(), "stockMinimo");
        assertEquals(25000, deserialized.getPrecioNeto(), "precioNeto");
        assertEquals(now, deserialized.getCreadoEn(), "creadoEn");
        assertEquals(now, deserialized.getActualizadoEn(), "actualizadoEn");
    }

    @Test
    void serializableMarkerInterface_present() {
        assertTrue(Serializable.class.isAssignableFrom(ProductEntity.class),
                "ProductEntity must implement Serializable");
    }
}
